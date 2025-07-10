#!/usr/bin/env python3
"""
PreToolUse hook for WebSearch date validation.
Ensures search queries account for current date context (2025).
"""

import json
import re
import sys
from datetime import datetime

def main():
    try:
        # Read the tool call JSON from stdin
        tool_call = json.load(sys.stdin)
        
        # Extract tool name and parameters
        tool_name = tool_call.get("name", "")
        parameters = tool_call.get("parameters", {})
        
        # Only validate WebSearch and WebFetch tools
        if tool_name not in ["WebSearch", "WebFetch"]:
            print(json.dumps({"continue": True}))
            return
        
        # Get the search query
        query = parameters.get("query", "")
        if not query:
            print(json.dumps({"continue": True}))
            return
        
        # Current year for validation
        current_year = datetime.now().year
        
        # Check for outdated year references
        year_pattern = r'\b(202[0-4])\b'
        outdated_years = re.findall(year_pattern, query)
        
        if outdated_years:
            response = {
                "decision": "block",
                "reason": f"Search query contains outdated year(s): {', '.join(set(outdated_years))}. Current year is {current_year}. Please update your search to reflect current date context."
            }
            print(json.dumps(response))
            sys.exit(2)
        
        # Check if query lacks current context for time-sensitive topics
        time_sensitive_keywords = [
            "latest", "current", "recent", "new", "update", "modern", 
            "today", "now", "documentation", "docs", "guide", "tutorial"
        ]
        
        has_time_sensitive = any(keyword in query.lower() for keyword in time_sensitive_keywords)
        has_year_context = bool(re.search(r'\b202[5-9]\b', query))
        
        if has_time_sensitive and not has_year_context:
            response = {
                "decision": "continue",
                "message": f"⚠️  Date Context Reminder: Searching for '{query}' - consider adding {current_year} to ensure current results"
            }
            print(json.dumps(response))
            return
        
        # Allow the search to continue
        print(json.dumps({"continue": True}))
        
    except Exception as e:
        # On error, allow the search but log the issue
        response = {
            "continue": True,
            "message": f"Date validation hook error: {str(e)}"
        }
        print(json.dumps(response))

if __name__ == "__main__":
    main()