# Vector Store Metadata Usage Guide

This guide explains how to use, add, and manage metadata when working with vector stores in the BPAZ-Agentic-Platform platform.

## 📊 What is Metadata?

Metadata is additional information stored with your documents. This information includes:
- Document source
- Category information  
- Date/time information
- Custom tags
- Fields used for filtering

## 🔧 Metadata with VectorStoreOrchestrator

### 1. Basic Metadata Addition

```json
{
  "custom_metadata": {
    "source": "amazon_catalog",
    "category": "electronics", 
    "department": "mobile_phones",
    "version": "2024-q4",
    "language": "en",
    "processed_date": "2024-08-06"
  }
}
```

### 2. Metadata Strategies

#### a) **Merge (Combination)** - Default
```json
{
  "metadata_strategy": "merge",
  "preserve_document_metadata": true,
  "custom_metadata": {
    "project": "bpaz-agentic-platform",
    "env": "production"
  }
}
```
- Document metadata is preserved
- Custom metadata is added
- Custom metadata takes priority in case of conflicts

#### b) **Replace (Replacement)**
```json
{
  "metadata_strategy": "replace", 
  "custom_metadata": {
    "source": "clean_data",
    "category": "manual_override"
  }
}
```
- Only custom metadata is used
- Document metadata is ignored

#### c) **Document Only (Document Only)**
```json
{
  "metadata_strategy": "document_only"
}
```
- Only document metadata is preserved
- Custom metadata is ignored

## 🏷️ Metadata Examples

### E-commerce Product Catalog
```json
{
  "custom_metadata": {
    "source": "product_catalog",
    "category": "electronics",
    "subcategory": "smartphones", 
    "brand": "Samsung",
    "price_range": "high",
    "availability": "in_stock",
    "rating": 4.5,
    "created_by": "catalog_import",
    "last_updated": "2024-08-06T10:00:00Z"
  }
}
```

### Customer Support Documents
```json
{
  "custom_metadata": {
    "source": "support_docs",
    "document_type": "faq", 
    "department": "technical_support",
    "priority": "high",
    "language": "en",
    "target_audience": ["beginners", "advanced"],
    "tags": ["troubleshooting", "installation", "configuration"],
    "version": "v2.1"
  }
}
```

### Legal Documents
```json
{
  "custom_metadata": {
    "source": "legal_documents",
    "document_type": "contract",
    "jurisdiction": "US",
    "law_area": "commercial",
    "confidentiality": "high",
    "client": "acme_corp", 
    "date_created": "2024-01-15",
    "expiry_date": "2025-01-15",
    "status": "active"
  }
}
```

## 🔍 Filtering with Metadata

### 1. Retriever Configuration
```python
# Filtering from vector store with specific metadata
search_kwargs = {
    "k": 10,
    "filter": {
        "source": "product_catalog",
        "category": "electronics",
        "price_range": {"$in": ["medium", "high"]}
    }
}

retriever = vectorstore.as_retriever(search_kwargs=search_kwargs)
```

### 2. Complex Filters
```python
# Multi-condition filtering
filter_conditions = {
    "department": "technical_support",
    "language": "en",
    "priority": {"$in": ["high", "critical"]},
    "created_date": {"$gte": "2024-01-01"},
    "tags": {"$contains": "troubleshooting"}
}
```

## 📋 Metadata Best Practices

### 1. **Consistent Field Names**
```json
// ✅ Correct
{
  "source": "catalog",
  "category": "electronics", 
  "created_date": "2024-08-06"
}

// ❌ Wrong (inconsistent naming)
{
  "Source": "catalog",
  "Category": "electronics",
  "createdDate": "2024-08-06"
}
```

### 2. **Standardize Values**
```json
// ✅ Correct - controlled values
{
  "priority": "high",  // "high" | "medium" | "low"
  "status": "active",  // "active" | "archived" | "draft"
  "language": "en"     // ISO codes
}

// ❌ Wrong - free text
{
  "priority": "Very Important",
  "status": "Currently Active", 
  "language": "Turkish"
}
```

### 3. **Hierarchical Metadata**
```json
{
  "source": {
    "system": "ecommerce",
    "module": "product_catalog", 
    "version": "v2.1"
  },
  "classification": {
    "category": "electronics",
    "subcategory": "mobile",
    "brand": "apple"
  },
  "timestamps": {
    "created": "2024-08-06T10:00:00Z",
    "modified": "2024-08-06T12:30:00Z",
    "indexed": "2024-08-06T13:00:00Z"
  }
}
```

## 🚀 Workflow Integration

### 1. Document Loader + Metadata
```json
{
  "nodes": [
    {
      "id": "doc_loader",
      "type": "DocumentLoader",
      "data": {
        "source": "web_scraping",
        "metadata_extraction": true
      }
    },
    {
      "id": "vector_store", 
      "type": "VectorStoreOrchestrator",
      "data": {
        "custom_metadata": {
          "project": "web_knowledge_base",
          "scraped_date": "{{current_date}}",
          "batch_id": "{{batch_id}}"
        },
        "metadata_strategy": "merge"
      }
    }
  ]
}
```

### 2. Dynamic Metadata
```json
{
  "custom_metadata": {
    "source": "{{source_system}}",
    "processed_by": "{{user_id}}",
    "workflow_id": "{{workflow.id}}",
    "processing_date": "{{current_timestamp}}",
    "input_hash": "{{documents.hash}}"
  }
}
```

## 🎯 Performance Optimization

### 1. **Indexed Fields**
```sql
-- GIN index for metadata (automatically created)
CREATE INDEX idx_metadata_gin ON langchain_pg_embedding USING gin (cmetadata);
```

### 2. **Frequently Used Filters**
```json
{
  "frequent_filters": {
    "source": "Source system - frequently filtered",
    "category": "Category - for narrowing search",  
    "language": "Language - for international applications",
    "status": "Status - active/passive filtering",
    "date_range": "Date - time-based filtering"
  }
}
```

### 3. **Metadata Size Optimization**
```json
// ✅ Optimal - compact metadata
{
  "src": "cat",          // "source": "catalog"
  "cat": "elec",         // "category": "electronics" 
  "lang": "en",          // "language": "en"
  "prio": 1,             // "priority": "high" -> numeric
  "created": 1704067200  // Unix timestamp
}

// ❌ Large metadata
{
  "source_system_full_name": "Product Catalog Management System v2.1",
  "category_description": "Electronics and Digital Devices Category",
  "detailed_priority_explanation": "High priority document requiring immediate attention"
}
```

## 🔗 API Usage

### 1. Search with Metadata
```python
from app.nodes.vector_stores import VectorStoreOrchestrator

# Creating vector store
orchestrator = VectorStoreOrchestrator()
result = orchestrator.execute(
    inputs={
        "connection_string": "postgresql://...",
        "collection_name": "products",
        "custom_metadata": {
            "source": "api_import",
            "batch_id": "batch_001",
            "imported_at": datetime.now().isoformat()
        }
    },
    connected_nodes={
        "documents": documents,
        "embedder": embedder
    }
)

# Metadata filtering with retriever
retriever = result["result"]
filtered_docs = retriever.get_relevant_documents(
    query="iPhone features",
    search_kwargs={
        "filter": {"source": "api_import", "category": "electronics"}
    }
)
```

### 2. Metadata Statistics
```python
# Metadata analysis with storage stats
stats = result["storage_stats"]
print(f"Stored documents: {stats['documents_stored']}")
print(f"Processing time: {stats['processing_time_seconds']}s")
```

## ⚡ Real-World Examples

### 1. **Multi-tenant Application**
```json
{
  "custom_metadata": {
    "tenant_id": "company_123",
    "user_group": "sales_team", 
    "access_level": "internal",
    "data_classification": "confidential"
  }
}
```

### 2. **Versioning**
```json
{
  "custom_metadata": {
    "document_version": "v1.2.3",
    "schema_version": "2024.1",
    "content_hash": "sha256:abc123...",
    "parent_document_id": "doc_456",
    "is_latest_version": true
  }
}
```

### 3. **A/B Testing**
```json
{
  "custom_metadata": {
    "experiment_id": "search_test_001",
    "variant": "B",
    "test_group": "power_users",
    "experiment_start": "2024-08-01",
    "success_metrics": ["click_rate", "conversion"]
  }
}
```

## 🛡️ Security Notes

### 1. **Sensitive Information**
```json
// ❌ Don't put sensitive information in metadata
{
  "user_password": "secret123",
  "credit_card": "1234-5678-9012-3456",
  "ssn": "123-45-6789"
}

// ✅ Safe metadata
{
  "user_id_hash": "sha256:abc...",
  "has_payment_info": true,
  "verification_status": "verified"
}
```

### 2. **Access Control**
```json
{
  "custom_metadata": {
    "visibility": "internal",
    "required_role": "analyst", 
    "security_clearance": "level_2",
    "data_owner": "marketing_dept"
  }
}
```

This guide provides all the information you need to effectively use metadata in the BPAZ-Agentic-Platform vector store system. When used correctly, metadata improves search performance and simplifies data management.
