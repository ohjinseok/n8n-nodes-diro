# n8n-nodes-diro

This is an n8n community node for [Diro](https://getdiro.com) - a document automation platform that generates PDF/PNG documents from templates.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

- **Generate Documents**: Create PDF or PNG documents from templates with dynamic data
- **Manage Documents**: List, retrieve, and delete generated documents
- **Manage Templates**: List and retrieve your document templates

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm install n8n-nodes-diro
```

## Credentials

To use this node, you need a Diro API key:

1. Sign up at [getdiro.com](https://getdiro.com)
2. Go to Dashboard > API Keys
3. Create a new API key (requires Pro or Enterprise plan)
4. Copy the API key (starts with `diro_`)

## Operations

### Document

| Operation | Description |
|-----------|-------------|
| **Generate** | Generate a new document from a template |
| **Get** | Get a document by ID |
| **Get Many** | List all documents |
| **Delete** | Delete a document |

### Template

| Operation | Description |
|-----------|-------------|
| **Get** | Get a template by ID (includes field definitions) |
| **Get Many** | List all templates |

## Usage

### Generate a Document

1. Add the **Diro** node to your workflow
2. Select **Document** as the resource
3. Select **Generate** as the operation
4. Enter the **Template ID** (from your Diro dashboard)
5. Enter the **Data** as JSON:

```json
{
  "name": "John Doe",
  "score": 85,
  "date": "2024-01-15"
}
```

6. (Optional) Set format to PDF or PNG
7. Execute the node

The response includes the document ID and download URL (`pdfUrl`).

### Example Workflow

```
[Webhook] -> [Diro: Generate Document] -> [Send Email with PDF link]
```

## Resources

- [Diro Documentation](https://docs.getdiro.com)
- [API Reference](https://docs.getdiro.com/api-reference/overview)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## Support

- For Diro-related issues: [support@getdiro.com](mailto:support@getdiro.com)
- For node bugs: [GitHub Issues](https://github.com/ohjinseok/n8n-nodes-diro/issues)

## License

[MIT](LICENSE.md)
