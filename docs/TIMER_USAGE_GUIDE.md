# ⏰ BPAZ-Agentic-Platform Timer Trigger Usage Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Creating Timers](#creating-timers)
- [Workflow Connection](#workflow-connection)
- [Schedule Types](#schedule-types)
- [Automatic Workflow Triggering](#automatic-workflow-triggering)
- [Usage Examples](#usage-examples)
- [Timer Management](#timer-management)
- [Monitoring & Statistics](#monitoring--statistics)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

BPAZ-Agentic-Platform Timer Trigger Node is an advanced triggering system that automatically starts workflows at specific time intervals or scheduled times. When the timer expires, it starts the workflow as if the manual start button was clicked and executes the complete processing chain.

### ✨ Core Features
- ⏰ **Multiple Scheduling Modes**: Interval, Cron, Once, Manual
- 🚀 **Automatic Workflow Triggering**: Starts workflow by connecting to Start node
- 🔄 **Automatic Restart**: Recurring schedules automatically restart
- 📊 **Advanced Monitoring**: Execution stats, timer status, performance metrics
- 🛡️ **Error Handling**: Retry logic, timeout handling, failure recovery
- ⚙️ **Flexible Configuration**: Max executions, timeout, retry settings
- 🎛️ **Manual Control**: Start/stop/trigger now functionality

---

## 🛠️ Creating Timers

### 1. Adding Node
Add the **Timer Start** node in the workflow editor:

```
Workflow: [Timer Start] → [Start Node] → [Processing...] → [End Node]
Position: BEFORE Start node (workflow entry point)
```

### 2. Basic Configuration

#### Interval Timer (At Regular Intervals)
```json
{
  "schedule_type": "interval",
  "interval_seconds": 3600,          // 1 hour (min: 30 seconds, max: 1 week)
  "auto_trigger_workflow": true,     // Automatic workflow triggering
  "enabled": true,                   // Is timer active?
  "max_executions": 0,               // Unlimited execution (0 = unlimited)
  "timeout_seconds": 300,            // Workflow timeout (5 minutes)
  "retry_on_failure": false,         // Retry on error
  "retry_count": 3                   // Retry count
}
```

#### Cron Timer (With Cron Expression)
```json
{
  "schedule_type": "cron",
  "cron_expression": "0 9 * * 1-5",  // Weekdays at 09:00
  "timezone": "Europe/Istanbul",     // Timezone
  "auto_trigger_workflow": true,
  "enabled": true,
  "max_executions": 100
}
```

#### Once Timer (One-Time)
```json
{
  "schedule_type": "once",
  "scheduled_time": "2025-08-05T15:30:00+03:00",  // ISO format
  "timezone": "Europe/Istanbul",
  "auto_trigger_workflow": true,
  "enabled": true
}
```

#### Manual Timer (Manual Triggering)
```json
{
  "schedule_type": "manual",
  "auto_trigger_workflow": false,    // Manual control
  "enabled": true,
  "trigger_data": {                  // Data to pass when timer is triggered
    "message": "Manual timer triggered",
    "source": "admin_dashboard"
  }
}
```

### 3. Advanced Settings

#### Production Configuration
```json
{
  "schedule_type": "interval",
  "interval_seconds": 1800,          // 30 minutes
  "auto_trigger_workflow": true,
  "enabled": true,
  "max_executions": 1000,            // Daily limit
  "timeout_seconds": 600,            // 10 minute timeout
  "retry_on_failure": true,          // Enable retry in production
  "retry_count": 3,
  "trigger_data": {
    "environment": "production",
    "priority": "high",
    "notification_channel": "alerts"
  }
}
```

---

## 🔗 Workflow Connection

### Connection Pattern
```
[Timer Start] ---> [Start Node] ---> [Processing Nodes] ---> [End Node]
       ↑               ↑                    ↑                   ↑
   Schedule Trigger  Workflow Entry    Processing Chain     Output Ready
```

### Making Connection
1. Select the **Timer Start** node's output
2. Connect it to the **Start Node**'s input
3. Create normal workflow chain

### Data Flow
```javascript
// Timer Configuration
{
  "schedule_type": "interval",
  "interval_seconds": 3600,
  "trigger_data": {
    "batch_id": "daily_reports",
    "source": "automated_system"
  }
}

// ↓ Timer expires and triggers

// Start Node receives
{
  "message": "Timer workflow initialized (interval)",
  "timer_trigger": true,
  "timer_id": "timer_abc123",
  "execution_id": "exec_def456",
  "triggered_at": "2025-08-05T09:00:00.000Z",
  "batch_id": "daily_reports",
  "source": "automated_system"
}
```

---

## ⏰ Schedule Types

### 1. Interval Timer
Recurring execution at specific time intervals.

```json
{
  "schedule_type": "interval",
  "interval_seconds": 1800  // 30 minutes
}
```

**Use Cases:**
- Data synchronization (every 15 minutes)
- Health checks (every 5 minutes)
- Report generation (every hour)
- Cache refresh (every 10 minutes)

### 2. Cron Timer
Advanced scheduling with Unix cron expression.

```json
{
  "schedule_type": "cron",
  "cron_expression": "0 2 * * *",    // Every day at 02:00
  "timezone": "Europe/Istanbul"
}
```

**Cron Expression Examples:**
```bash
"0 */6 * * *"      # Every 6 hours
"0 9 * * 1-5"      # Weekdays at 09:00
"0 0 1 * *"        # First day of each month at midnight
"*/15 * * * *"     # Every 15 minutes
"0 22 * * 0"       # Every Sunday at 22:00
```

### 3. Once Timer
One-time execution at a specific time.

```json
{
  "schedule_type": "once",
  "scheduled_time": "2025-08-05T15:30:00+03:00"
}
```

**Use Cases:**
- Scheduled maintenance
- One-time data migration
- Special event triggers
- Campaign launches

### 4. Manual Timer
Only works with manual triggering.

```json
{
  "schedule_type": "manual",
  "auto_trigger_workflow": false
}
```

**Use Cases:**
- Admin operations
- Debug workflows
- On-demand processing
- Testing scenarios

---

## 🚀 Automatic Workflow Triggering

### Triggering Mechanism
When timer expires:

1. **Timer Loop**: Async timer loop running in background
2. **Workflow Execution**: Workflow executed via engine
3. **Execution Queue**: Execution slot acquire/release
4. **Error Handling**: Timeout, retry, failure recovery
5. **Statistics Update**: Execution count, last run time update

### Execution Context
```python
# Timer trigger execution inputs
execution_inputs = {
    "timer_trigger": True,
    "timer_id": "timer_abc123",
    "execution_id": "exec_def456",
    "triggered_at": "2025-08-05T09:00:00.000Z",
    **trigger_data  # User-defined trigger data
}

# User context
user_context = {
    "user_id": "user_789",
    "workflow_id": "workflow_123",
    "execution_id": "exec_def456",
    "trigger_type": "timer",
    "timer_id": "timer_abc123"
}
```

### Automatic Restart
Recurring timers (interval, cron) automatically restart:

```python
# Interval timer restart logic
if schedule_type == "interval":
    next_run = last_execution + interval_seconds
    
# Cron timer restart logic  
if schedule_type == "cron":
    next_run = croniter(cron_expression, last_execution).get_next()
    
# Once timer - no restart
if schedule_type == "once":
    timer_stops_after_execution = True
```

---

## 📚 Usage Examples

### 1. Daily Report Generation

#### Workflow Setup
```
[Timer Start] → [Start] → [Data Fetcher] → [Report Generator] → [Email Sender] → [End]
```

#### Configuration
```json
{
  "schedule_type": "cron",
  "cron_expression": "0 8 * * 1-5",  // Weekdays at 08:00
  "timezone": "Europe/Istanbul",
  "auto_trigger_workflow": true,
  "enabled": true,
  "max_executions": 0,
  "timeout_seconds": 1800,           // 30 minute timeout
  "retry_on_failure": true,
  "retry_count": 2,
  "trigger_data": {
    "report_type": "daily_summary",
    "recipients": ["admin@company.com"],
    "include_charts": true,
    "date_range": "yesterday"
  }
}
```

### 2. Data Synchronization

#### Workflow Setup
```
[Timer Start] → [Start] → [API Fetcher] → [Data Processor] → [Database Writer] → [End]
```

#### Configuration
```json
{
  "schedule_type": "interval",
  "interval_seconds": 900,           // 15 minutes
  "auto_trigger_workflow": true,
  "enabled": true,
  "max_executions": 0,
  "timeout_seconds": 300,
  "retry_on_failure": true,
  "retry_count": 3,
  "trigger_data": {
    "sync_type": "incremental",
    "data_sources": ["crm", "inventory", "orders"],
    "batch_size": 1000
  }
}
```

### 3. System Health Monitoring

#### Workflow Setup
```
[Timer Start] → [Start] → [Health Checker] → [Metrics Collector] → [Alert Processor] → [End]
```

#### Configuration
```json
{
  "schedule_type": "interval",
  "interval_seconds": 300,           // 5 minutes
  "auto_trigger_workflow": true,
  "enabled": true,
  "max_executions": 0,
  "timeout_seconds": 120,            // 2 minute timeout
  "retry_on_failure": false,         // Don't retry on health check failure
  "trigger_data": {
    "check_type": "full_system",
    "services": ["database", "redis", "elasticsearch", "api"],
    "alert_threshold": "warning",
    "notification_channels": ["slack", "email"]
  }
}
```

### 4. Content Processing Pipeline

#### Workflow Setup
```
[Timer Start] → [Start] → [Content Fetcher] → [Text Processor] → [Vector Store] → [End]
```

#### Configuration
```json
{
  "schedule_type": "cron",
  "cron_expression": "0 */4 * * *",  // Every 4 hours
  "timezone": "UTC",
  "auto_trigger_workflow": true,
  "enabled": true,
  "max_executions": 6,               // 6 times per day (24/4)
  "timeout_seconds": 3600,           // 1 hour timeout
  "retry_on_failure": true,
  "retry_count": 2,
  "trigger_data": {
    "content_sources": [
      "https://tech-blog.com/feed.xml",
      "https://news-api.com/latest"
    ],
    "processing_options": {
      "extract_text": true,
      "generate_embeddings": true,
      "chunk_size": 1000,
      "overlap": 200
    },
    "output_collection": "tech_content"
  }
}
```

### 5. Backup & Cleanup Operations

#### Workflow Setup
```
[Timer Start] → [Start] → [Backup Creator] → [File Cleanup] → [Notification] → [End]
```

#### Configuration
```json
{
  "schedule_type": "cron",
  "cron_expression": "0 2 * * 0",    // Every Sunday at 02:00
  "timezone": "Europe/Istanbul",
  "auto_trigger_workflow": true,
  "enabled": true,
  "max_executions": 0,
  "timeout_seconds": 7200,           // 2 hour timeout
  "retry_on_failure": true,
  "retry_count": 1,
  "trigger_data": {
    "backup_type": "weekly_full",
    "backup_targets": ["database", "uploads", "logs"],
    "cleanup_older_than": "30_days",
    "compression": true,
    "encryption": true,
    "storage_location": "s3://backups/weekly/"
  }
}
```

---

## 🎛️ Timer Management

### Manual Control Interface

#### Start Timer
```python
timer_result = timer_node.start_timer()
# Returns: {"success": True, "message": "Timer timer_abc123 started"}
```

#### Stop Timer
```python
stop_result = timer_node.stop_timer()
# Returns: {"success": True, "message": "Timer timer_abc123 stopped"}
```

#### Trigger Now (Immediate Execution)
```python
trigger_result = await timer_node.trigger_now()
# Returns: {"success": True, "message": "Timer timer_abc123 triggered manually", "execution_id": "exec_xyz"}
```

#### Get Timer Status
```python
status = timer_node.get_timer_status()
# Returns:
{
  "timer_id": "timer_abc123",
  "is_active": True,
  "timer_stats": {
    "status": "running",
    "execution_count": 15,
    "last_execution": "2025-08-05T09:00:00.000Z",
    "next_execution": "2025-08-05T10:00:00.000Z"
  },
  "schedule_info": {
    "schedule_type": "interval",
    "interval_seconds": 3600,
    "enabled": True,
    "max_executions": 0
  }
}
```

### Global Timer Management

#### Get All Active Timers
```python
from app.nodes.triggers.timer_start_node import get_active_timers

active_timers = get_active_timers()
print(f"Active timers: {len(active_timers)}")
for timer_id, timer_info in active_timers.items():
    print(f"{timer_id}: {timer_info['status']}")
```

#### Stop All Timers
```python
from app.nodes.triggers.timer_start_node import stop_all_timers

stop_all_timers()
print("All timers stopped")
```

#### Cleanup Completed Timers
```python
from app.nodes.triggers.timer_start_node import cleanup_completed_timers

cleaned_count = cleanup_completed_timers()
print(f"Cleaned up {cleaned_count} completed timers")
```

---

## 📊 Monitoring & Statistics

### Timer Statistics
```python
timer_stats = timer_node._get_timer_stats()
```

**Available Metrics:**
```json
{
  "timer_id": "timer_abc123",
  "status": "running",                    // running, stopped, error, completed
  "created_at": "2025-08-05T08:00:00.000Z",
  "execution_count": 25,                  // Total executions
  "last_execution": "2025-08-05T09:00:00.000Z",
  "next_execution": "2025-08-05T10:00:00.000Z",
  "is_active": true,
  "workflow_id": "workflow_123",
  "user_id": "user_789"
}
```

### Schedule Information
```python
schedule_info = timer_node._get_schedule_info()
```

**Schedule Details:**
```json
{
  "schedule_type": "interval",
  "next_run": "2025-08-05T10:00:00.000Z",
  "interval_seconds": 3600,
  "cron_expression": null,
  "scheduled_time": null,
  "timezone": "UTC",
  "enabled": true,
  "auto_trigger_workflow": true,
  "max_executions": 0,
  "timeout_seconds": 300
}
```

### Performance Metrics
The timer node tracks the following metrics:

- **Execution Count**: Total execution count
- **Success Rate**: Successful execution rate
- **Average Execution Time**: Average execution duration
- **Error Rate**: Error rate
- **Next Run Time**: Next execution time
- **Timer Status**: Active/passive status

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Timer Not Starting
```
Error: Timer created but not executing automatically
```

**Solution:**
- Check that `enabled: true`
- Check that `auto_trigger_workflow: true`
- Check that `schedule_type` is not "manual"
- Check that workflow context (workflow_id, user_id) is set

#### 2. Cron Expression Invalid
```
Error: Invalid cron expression '0 25 * * *': Invalid minute value
```

**Solution:**
- Check cron expression syntax: `minute hour day month weekday`
- Use an online cron validator
- Check timezone settings

#### 3. Workflow Execution Timeout
```
Error: Timer timer_abc123 workflow execution timed out: exec_def456
```

**Solution:**
- Increase `timeout_seconds` value
- Optimize workflow node performance
- Check resource usage

#### 4. Max Executions Reached
```
Info: Timer timer_abc123 reached max executions limit: 100
```

**Solution:**
- Increase `max_executions` value or set to 0 (unlimited)
- Reset the timer
- Clear execution history

#### 5. Timer Loop Error
```
Error: Timer timer_abc123 loop error: Connection to database lost
```

**Solution:**
- Check database connection
- Set `retry_on_failure: true`
- Review error logs in detail

### Debug Commands

#### Test Timer Configuration
```python
# Test timer creation and configuration
timer_node = TimerStartNode()
timer_node.user_data = {
    "schedule_type": "interval",
    "interval_seconds": 60,
    "auto_trigger_workflow": True,
    "enabled": True
}

state = FlowState()
state.workflow_id = "test-workflow"
state.user_id = "test-user"

result = timer_node._execute(state)
print(f"Timer Status: {result['status']}")
print(f"Next Run: {result['schedule_info']['next_run']}")
```

#### Test Manual Trigger
```python
# Test manual workflow triggering
async def test_manual_trigger():
    trigger_result = await timer_node.trigger_now()
    print(f"Manual Trigger Result: {trigger_result}")

asyncio.run(test_manual_trigger())
```

#### Check Timer Health
```python
# Check timer health and status
status = timer_node.get_timer_status()
print(f"Timer Active: {status['is_active']}")
print(f"Execution Count: {status['timer_stats']['execution_count']}")
print(f"Last Execution: {status['timer_stats']['last_execution']}")
```

### Log Analysis
The timer node provides comprehensive logging:

```python
import logging
logging.getLogger('app.nodes.triggers.timer_start_node').setLevel(logging.DEBUG)
```

**Log Levels:**
- `INFO`: Timer start/stop, execution triggers
- `DEBUG`: Detailed execution flow, sleep times
- `WARNING`: Configuration issues, missing context
- `ERROR`: Execution failures, timeout errors

---

## 🚀 Production Deployment

### Environment Configuration
```bash
# Timer-specific environment variables
export TIMER_DEFAULT_TIMEOUT=300
export TIMER_MAX_CONCURRENT=10
export TIMER_CLEANUP_INTERVAL=3600

# LangChain integration
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_PROJECT="bpaz-agentic-platform-timers"
```

### Production Settings
```json
{
  "schedule_type": "interval",
  "interval_seconds": 1800,
  "auto_trigger_workflow": true,
  "enabled": true,
  "max_executions": 1000,           // Daily limit
  "timeout_seconds": 900,           // 15 minutes
  "retry_on_failure": true,
  "retry_count": 3,
  "trigger_data": {
    "environment": "production",
    "monitoring": true,
    "alerting": true
  }
}
```

### Monitoring & Alerting
```python
# Production monitoring setup
def setup_timer_monitoring():
    """Setup production monitoring for timers."""
    
    # Health check endpoint
    @app.get("/api/timers/health")
    async def timer_health_check():
        active_timers = get_active_timers()
        return {
            "status": "healthy",
            "active_timers": len(active_timers),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    # Timer statistics endpoint
    @app.get("/api/timers/stats")
    async def timer_statistics():
        return {
            "timers": get_active_timers(),
            "total_executions": sum(t["execution_count"] for t in active_timers.values()),
            "running_timers": len([t for t in active_timers.values() if t["status"] == "running"])
        }
```

---

## 📞 Support

### Documentation
- [Webhook Integration Guide](./WEBHOOK_USAGE_GUIDE.md)
- [API Reference](./api-reference.md)
- [Workflow Design Guide](./workflow-guide.md)

### Best Practices
- Test timers carefully in production
- Set max executions limit
- Adjust timeout values according to workflow complexity
- Implement error handling and retry logic
- Setup monitoring and alerting

### Contact
- GitHub Issues: [BPAZ-Agentic-Platform Issues](https://github.com/bpaz-agentic-platform/issues)
- Email: support@bpaz-agentic-platform.com
- Discord: BPAZ-Agentic-Platform Community

---

## 📈 Version History

- **v2.1.0**: Current version with enhanced automatic triggering
- **v2.0.0**: Complete rewrite with webhook-like functionality
- **v1.x**: Basic timer implementation (deprecated)

**Last Updated:** 2025-08-05  
**Status:** ✅ Production Ready

---

## 🎯 Quick Start Checklist

- [ ] Timer node added to workflow
- [ ] Connected to Start node
- [ ] Schedule type selected (interval/cron/once/manual)
- [ ] `auto_trigger_workflow: true` set
- [ ] `enabled: true` set
- [ ] Timeout and retry settings configured
- [ ] Tested and working
- [ ] Monitoring setup in production

The timer trigger node is now ready to work with full integration like the webhook trigger with automatic workflow triggering! 🚀
