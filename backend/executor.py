import pandas as pd
import json

def execute_plan(df: pd.DataFrame, plan: dict) -> dict:
    """
    Executes a structured op spec deterministically using pandas.
    Returns a dict with { 'value': result, 'operation_used': string, 'rows_matched': int }
    """
    original_len = len(df)
    op_str = []
    
    # 1. Filter
    if 'filter' in plan and plan['filter']:
        for col, val in plan['filter'].items():
            if col in df.columns:
                df = df[df[col] == val]
                op_str.append(f"filter({col}={val})")
                
    rows_matched = len(df)
    
    # 2. Timeseries / Pct Change
    if plan.get('operation') == 'pct_change':
        # assume df is sorted by time
        if 'metric' in plan and plan['metric'] in df.columns:
            metric = plan['metric']
            if len(df) >= 2:
                # get last two rows
                last_val = df.iloc[-1][metric]
                prev_val = df.iloc[-2][metric]
                if prev_val != 0:
                    pct = ((last_val - prev_val) / prev_val) * 100
                    op_str.append(f"pct_change({metric})")
                    return {
                        "value": round(pct, 2),
                        "operation_used": " ".join(op_str),
                        "rows_matched": rows_matched
                    }
    
    # 3. Groupby & Aggregate
    op_name = plan.get('operation', '').lower()
    if 'groupby' in op_name or 'group' in op_name:
        # Fuzzy key matching
        group_cols = plan.get('group_by') or plan.get('groupby') or plan.get('by')
        if isinstance(group_cols, str):
            group_cols = [group_cols]
            
        metric = plan.get('metric') or plan.get('column')
        agg_val = plan.get('aggregate') or plan.get('agg', 'sum')
        
        # If aggregate is a dict like {"revenue": "sum"}
        if isinstance(agg_val, dict) and not metric:
            metric = list(agg_val.keys())[0]
            agg_func = agg_val[metric]
        else:
            agg_func = agg_val
            
        if group_cols and metric:
            grouped = df.groupby(group_cols)[metric].agg(agg_func).reset_index()
            op_str.append(f"groupby({','.join(group_cols)}) {agg_func}({metric})")
            
            # Fuzzy sort checking
            sort_val = plan.get('sort')
            if isinstance(sort_val, dict):
                # e.g. {"by": "revenue", "ascending": false}
                asc = sort_val.get('ascending', False)
                grouped = grouped.sort_values(by=metric, ascending=asc)
                op_str.append(f"sort({'asc' if asc else 'desc'})")
            elif isinstance(sort_val, str):
                if 'desc' in sort_val.lower():
                    grouped = grouped.sort_values(by=metric, ascending=False)
                    op_str.append("sort(desc)")
                elif 'asc' in sort_val.lower():
                    grouped = grouped.sort_values(by=metric, ascending=True)
                    op_str.append("sort(asc)")
                
            # CRITICAL: We DO NOT slice with head/top_n here so the UI always has the full array to plot the chart!
            # We let the LLM extract the top value itself for the plain English answer.
                
            # Convert NaN to None for JSON compliance
            # Must cast to object first, otherwise Pandas coerces None back to NaN on float columns
            grouped = grouped.astype(object).where(pd.notna(grouped), None)
            
            # Return records
            return {
                "value": grouped.to_dict(orient='records'),
                "operation_used": " ".join(op_str),
                "rows_matched": rows_matched
            }
            
    # 4. Simple Aggregate (no group by)
    if op_name == 'aggregate' or op_name in ['sum', 'mean', 'count', 'max', 'min']:
        metric = plan.get('metric') or plan.get('column')
        agg_func = plan.get('aggregate') or plan.get('agg') or (op_name if op_name != 'aggregate' else 'sum')
        if isinstance(agg_func, dict):
            metric = list(agg_func.keys())[0]
            agg_func = agg_func[metric]
            
        if metric:
            val = df[metric].agg(agg_func)
            op_str.append(f"{agg_func}({metric})")
            
            # convert numpy types to python native
            if hasattr(val, 'item'):
                val = val.item()
                
            if pd.isna(val):
                val = None
                
            return {
                "value": val,
                "operation_used": " ".join(op_str),
                "rows_matched": rows_matched
            }

    # Default fallback: return matched rows or raw data
    op_str.append("return_raw")
    fallback_df = df.head(10)
    fallback_df = fallback_df.astype(object).where(pd.notna(fallback_df), None)
    return {
        "value": fallback_df.to_dict(orient='records'),
        "operation_used": " ".join(op_str),
        "rows_matched": rows_matched
    }
