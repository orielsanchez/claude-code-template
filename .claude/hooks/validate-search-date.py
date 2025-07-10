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
        
        # Check for historical intent keywords
        historical_keywords = [
            "history", "changelog", "release", "version", "archive", 
            "legacy", "migration", "deprecated", "old", "previous",
            "comparison", "vs", "versus", "difference", "evolution",
            "retrospective", "review", "what happened", "timeline",
            "older", "past", "former", "earlier"
        ]
        
        # Check for explicit historical intent
        explicit_historical = any(keyword in query.lower() for keyword in historical_keywords)
        
        # Check if query already has old years (2020-2024)
        old_year_pattern = r'\b(202[0-4])\b'
        mentioned_old_years = re.findall(old_year_pattern, query)
        
        # Check if query already has current/future years (2025+)
        current_year_pattern = r'\b(202[5-9])\b'
        has_current_year = bool(re.search(current_year_pattern, query))
        
        # If historical intent with old years, allow as-is
        if explicit_historical and mentioned_old_years:
            response = {
                "continue": True,
                "message": f"ℹ️  Historical search detected for {', '.join(set(mentioned_old_years))} - preserving original query"
            }
            print(json.dumps(response))
            return
        
        # If old years without historical intent, suggest current context
        if mentioned_old_years and not explicit_historical:
            response = {
                "decision": "continue",
                "message": f"⚠️  Query mentions {', '.join(set(mentioned_old_years))} but current year is {current_year}. Add 'historical' if you want old info, otherwise search will default to current context."
            }
            print(json.dumps(response))
            return
        
        # For queries without year context, suggest adding current year
        time_sensitive_keywords = [
            "latest", "current", "recent", "new", "update", "modern", 
            "documentation", "docs", "guide", "tutorial", "best practices"
        ]
        
        has_time_sensitive = any(keyword in query.lower() for keyword in time_sensitive_keywords)
        
        if (has_time_sensitive or not has_current_year) and not explicit_historical:
            # Suggest modified query with current year
            modified_query = f"{query} {current_year}"
            response = {
                "decision": "continue",
                "message": f"💡 Auto-suggesting current context: Consider searching '{modified_query}' for {current_year} results"
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