#!/usr/bin/env python3
"""
PostToolUse hook for WebSearch result validation.
Analyzes search results to warn about potentially outdated information.
"""

import json
import re
import sys
from datetime import datetime

def main():
    try:
        # Read the tool execution result from stdin
        tool_result = json.load(sys.stdin)
        
        # Extract tool name and result
        tool_name = tool_result.get("name", "")
        result = tool_result.get("result", "")
        error = tool_result.get("error", "")
        
        # Only validate WebSearch and WebFetch tools
        if tool_name not in ["WebSearch", "WebFetch"]:
            print(json.dumps({"continue": True}))
            return
        
        # Skip if there was an error
        if error:
            print(json.dumps({"continue": True}))
            return
        
        # Convert result to string for analysis
        result_text = str(result)
        
        current_year = datetime.now().year
        
        # Check for outdated year mentions in results
        year_pattern = r'\b(202[0-4])\b'
        outdated_years = re.findall(year_pattern, result_text)
        
        # Check for date-related patterns that might indicate old content
        old_date_patterns = [
            r'updated.*202[0-4]',
            r'published.*202[0-4]',
            r'last.*modified.*202[0-4]',
            r'copyright.*202[0-4]'
        ]
        
        old_dates_found = []
        for pattern in old_date_patterns:
            matches = re.findall(pattern, result_text, re.IGNORECASE)
            old_dates_found.extend(matches)
        
        # Generate warnings based on findings
        warnings = []
        
        if outdated_years:
            unique_years = sorted(set(outdated_years))
            warnings.append(f"Search results contain references to {', '.join(unique_years)}. Current year is {current_year}.")
        
        if old_dates_found:
            warnings.append(f"Found {len(old_dates_found)} potentially outdated timestamps in results.")
        
        # Check if results seem to lack recent information
        has_current_year = bool(re.search(rf'\b{current_year}\b', result_text))
        has_recent_indicators = bool(re.search(r'\b(latest|current|recent|new|updated)\b', result_text, re.IGNORECASE))
        
        if not has_current_year and has_recent_indicators:
            warnings.append("Results claim to be 'recent' or 'latest' but don't mention current year.")
        
        # Output appropriate response
        if warnings:
            response = {
                "continue": True,
                "message": f"⚠️  Search Result Date Warning:\n" + "\n".join(f"• {w}" for w in warnings) + f"\n• Consider refining search with '{current_year}' for more current results"
            }
            print(json.dumps(response))
        else:
            print(json.dumps({"continue": True}))
        
    except Exception as e:
        # On error, allow continuation but log the issue
        response = {
            "continue": True,
            "message": f"Search result validation hook error: {str(e)}"
        }
        print(json.dumps(response))

if __name__ == "__main__":
    main()