import { CreateCommentInput, ToggleReactionInput } from "../types/interaction";
import { ValidationError, ValidationResult } from "./habitValidation";

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUuid(id: string): boolean {
  return typeof id === "string" && uuidRegex.test(id);
}

export function validateCreateCommentInput(input: any): ValidationResult<CreateCommentInput> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: [{ field: "input", message: "Input must be a valid object" }],
    };
  }

  // log_id (Required)
  if (input.log_id === undefined || input.log_id === null) {
    errors.push({ field: "log_id", message: "Log ID is required" });
  } else if (typeof input.log_id !== "string") {
    errors.push({ field: "log_id", message: "Log ID must be a string" });
  } else if (!isValidUuid(input.log_id)) {
    errors.push({ field: "log_id", message: "Log ID must be a valid UUID" });
  }

  // user_id (Required)
  if (input.user_id === undefined || input.user_id === null) {
    errors.push({ field: "user_id", message: "User ID is required" });
  } else if (typeof input.user_id !== "string") {
    errors.push({ field: "user_id", message: "User ID must be a string" });
  } else if (!isValidUuid(input.user_id)) {
    errors.push({ field: "user_id", message: "User ID must be a valid UUID" });
  }

  // content (Required)
  if (input.content === undefined || input.content === null) {
    errors.push({ field: "content", message: "Content is required" });
  } else if (typeof input.content !== "string") {
    errors.push({ field: "content", message: "Content must be a string" });
  } else {
    const trimmed = input.content.trim();
    if (trimmed.length === 0) {
      errors.push({ field: "content", message: "Comment content cannot be blank" });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      log_id: input.log_id,
      user_id: input.user_id,
      content: input.content.trim(),
    },
  };
}

export function validateToggleReactionInput(input: any): ValidationResult<ToggleReactionInput> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: [{ field: "input", message: "Input must be a valid object" }],
    };
  }

  // log_id (Required)
  if (input.log_id === undefined || input.log_id === null) {
    errors.push({ field: "log_id", message: "Log ID is required" });
  } else if (typeof input.log_id !== "string") {
    errors.push({ field: "log_id", message: "Log ID must be a string" });
  } else if (!isValidUuid(input.log_id)) {
    errors.push({ field: "log_id", message: "Log ID must be a valid UUID" });
  }

  // user_id (Required)
  if (input.user_id === undefined || input.user_id === null) {
    errors.push({ field: "user_id", message: "User ID is required" });
  } else if (typeof input.user_id !== "string") {
    errors.push({ field: "user_id", message: "User ID must be a string" });
  } else if (!isValidUuid(input.user_id)) {
    errors.push({ field: "user_id", message: "User ID must be a valid UUID" });
  }

  // reaction_type (Required)
  if (input.reaction_type === undefined || input.reaction_type === null) {
    errors.push({ field: "reaction_type", message: "Reaction type is required" });
  } else if (typeof input.reaction_type !== "string") {
    errors.push({ field: "reaction_type", message: "Reaction type must be a string" });
  } else {
    const trimmed = input.reaction_type.trim();
    if (trimmed.length === 0) {
      errors.push({ field: "reaction_type", message: "Reaction type cannot be blank" });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      log_id: input.log_id,
      user_id: input.user_id,
      reaction_type: input.reaction_type.trim(),
    },
  };
}
