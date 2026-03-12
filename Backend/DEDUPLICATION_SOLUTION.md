# Project Deduplication Solution

## Problem
The agent was generating and saving similar/duplicate projects to the database, filling it with redundant content when recommending projects to users.

## Solution Implemented
Added a **similarity checking system** that detects and prevents duplicate projects from being saved.

### How It Works

#### 1. **New Similarity Checker Module** (`utils/agent_nodes/similarity_checker.py`)
   - **`calculate_text_similarity()`**: Compares project titles and descriptions using string similarity (0.0-1.0 scale)
   - **`calculate_technologies_overlap()`**: Checks how many technologies overlap between projects
   - **`find_similar_projects()`**: Main function that:
     - Compares new projects against the last 20 AI-generated projects
     - Uses weighted scoring: Title (40%) + Description (40%) + Technologies (20%)
     - Returns similarity details and whether it's a duplicate

#### 2. **Updated Project Recommendation Node** (`utils/agent_nodes/project_recommendation_node.py`)
   - Before saving a newly generated project, checks it against recent projects
   - If similarity score ≥ 75%, reuses the existing similar project instead of saving a duplicate
   - Only saves truly unique projects to avoid database bloat

### Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `similarity_threshold` | 0.75 | Similarity score (0-1) above which projects are considered duplicates |
| `recent_count` | 20 | Number of recent AI-generated projects to compare against |

### Benefits

✅ **Reduces Database Bloat**: No more duplicate/similar projects cluttering the collection
✅ **Efficient**: Only checks against recent projects, not the entire collection
✅ **Smart Reuse**: Reuses existing projects for users when similar to newly generated ones
✅ **Logging**: Prints duplicate detection for debugging and monitoring

### Example Output
```
[DUPLICATE DETECTED] Similar title (0.82 match) (score: 0.76)
[DUPLICATE DETECTED] Similar description (0.85 match) (score: 0.77)
```

## Tuning the System

If you want to be more/less strict about duplicates:
- **More Strict** (fewer duplicates saved): Lower `similarity_threshold` to 0.70
- **Less Strict** (more variation allowed): Increase `similarity_threshold` to 0.85

Current setting of 0.75 is a good balance.

## Testing

The system works automatically in your agent workflow. To verify:
1. Monitor the console logs when running the learning cycle
2. Check if fewer duplicate projects are being saved
3. Verify existing projects are being reused for similar skill targets
