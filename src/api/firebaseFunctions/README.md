# Firebase Functions - Organized Structure

This directory provides a well-organized, type-safe approach to managing Firebase Cloud Functions in the frontend application.

## 📁 Structure

```
firebaseFunctions/
├── index.ts        # Main exports file
├── types.ts        # Enums and type definitions
├── auth.ts         # Authentication functions
├── messaging.ts    # Messaging functions
└── templates.ts    # Template management functions
```

## 🎯 Key Features

### ✅ **Type-Safe Enums**

Each function category has its own enum for complete type safety:

```typescript
// Function name enums
export enum AuthFunctions {
  SET_USER_CUSTOM_CLAIMS = "setUserCustomClaims",
  REMOVE_USER_CUSTOM_CLAIMS = "removeUserCustomClaims",
  GET_USER_CUSTOM_CLAIMS = "getUserCustomClaims",
  FIND_USER_BY_EMAIL = "findUserByEmail",
}

export enum MessagingFunctions {
  SEND_WHATSAPP_MESSAGE = "sendWhatsAppMessage",
  SEND_SMS_MESSAGE = "sendSmsMessage",
  GET_MESSAGE_STATUS = "getMessageStatus",
}

export enum TemplateFunctions {
  GET_MESSAGE_TEMPLATES = "getMessageTemplates",
  CREATE_MESSAGE_TEMPLATE = "createMessageTemplate",
  DELETE_MESSAGE_TEMPLATE = "deleteMessageTemplate",
  SUBMIT_TEMPLATE_APPROVAL = "submitTemplateApproval",
  GET_TEMPLATE_APPROVAL_STATUS = "getTemplateApprovalStatus",
}
```

### ✅ **Organized Collections**

Functions are grouped by category with both collection and individual exports:

```typescript
// Collection approach
import { authFunctions, AuthFunctions } from "./firebaseFunctions";
await authFunctions[AuthFunctions.SET_USER_CUSTOM_CLAIMS](data);

// Individual function approach
import { setUserCustomClaims } from "./firebaseFunctions";
await setUserCustomClaims(data);
```

### ✅ **Complete Type Safety**

All function names and return types are properly typed:

```typescript
type FunctionName = AuthFunctions | MessagingFunctions | TemplateFunctions;
```

## 🚀 Usage Examples

### **1. Authentication Functions**

```typescript
import { authFunctions, AuthFunctions } from "./api/firebaseFunctions";

// Add user to wedding
const result = await authFunctions[AuthFunctions.SET_USER_CUSTOM_CLAIMS]({
  userId: "user123",
  weddingId: "wedding456",
  role: "bride",
});

// Find user by email
const user = await authFunctions[AuthFunctions.FIND_USER_BY_EMAIL]({
  email: "bride@example.com",
});
```

### **2. Messaging Functions**

```typescript
import {
  messagingFunctions,
  MessagingFunctions,
} from "./api/firebaseFunctions";

// Send WhatsApp message
const whatsapp = await messagingFunctions[
  MessagingFunctions.SEND_WHATSAPP_MESSAGE
]({
  to: "whatsapp:+1234567890",
  contentSid: "template123",
  contentVariables: { name: "John", date: "2025-12-25" },
});

// Send SMS message
const sms = await messagingFunctions[MessagingFunctions.SEND_SMS_MESSAGE]({
  to: "+1234567890",
  contentSid: "template123",
  contentVariables: { name: "John", date: "2025-12-25" },
});
```

### **3. Template Functions**

```typescript
import { templateFunctions, TemplateFunctions } from "./api/firebaseFunctions";

// Get all templates
const templates = await templateFunctions[
  TemplateFunctions.GET_MESSAGE_TEMPLATES
]();

// Create new template
const newTemplate = await templateFunctions[
  TemplateFunctions.CREATE_MESSAGE_TEMPLATE
]({
  friendly_name: "Wedding Invitation",
  language: "en",
  variables: { bride_name: "string", groom_name: "string" },
  types: {
    "twilio/text": {
      body: "Hi {{bride_name}}! Your wedding is confirmed!",
    },
  },
});
```

## 📖 Import Options

### **Option 1: Individual Functions**

```typescript
import {
  setUserCustomClaims,
  sendWhatsAppMessage,
  getMessageTemplates,
} from "./api/firebaseFunctions";
```

### **Option 2: Organized Collections**

```typescript
import {
  authFunctions,
  messagingFunctions,
  templateFunctions,
  AuthFunctions,
  MessagingFunctions,
  TemplateFunctions,
} from "./api/firebaseFunctions";
```

### **Option 3: Everything**

```typescript
import * as FirebaseFunctions from "./api/firebaseFunctions";
```

## 🎛️ Benefits

1. **🔒 Type Safety**: Compile-time checking of function names
2. **📚 Organization**: Clear categorization by functionality
3. **🔍 Discoverability**: Easy to find the right function
4. **♻️ Reusability**: Consistent patterns across the app
5. **🛠️ Maintainability**: Easy to add/modify functions
6. **📝 Documentation**: Self-documenting code with enums

## 🔄 Migration

Existing code using the old approach will continue to work thanks to backward compatibility exports in `firebaseFunctions.ts`. New code should use the organized structure for better maintainability.

---

This organized approach provides a scalable, type-safe foundation for managing Firebase Functions as your application grows! 🚀
