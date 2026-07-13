import {
  CreateHabitInput,
  UpdateHabitInput,
  DifficultyTier,
  HabitFrequency,
  HabitStatus,
} from "../types/habit";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const validDifficultyTiers: DifficultyTier[] = ["common", "uncommon", "rare", "mythical"];
const validFrequencies: HabitFrequency[] = [
  "twice_daily",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "flexible",
];
const validStatuses: HabitStatus[] = ["healthy", "withered", "completed"];

function isInteger(val: any): val is number {
  return typeof val === "number" && Number.isInteger(val);
}

function validateCommonFields(input: any, errors: ValidationError[]) {
  // Description
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== "string") {
      errors.push({ field: "description", message: "Description must be a string" });
    }
  }

  // Plant Type
  if (input.plant_type !== undefined) {
    if (typeof input.plant_type !== "string") {
      errors.push({ field: "plant_type", message: "Plant type must be a string" });
    } else if (input.plant_type.length > 50) {
      errors.push({ field: "plant_type", message: "Plant type must be 50 characters or less" });
    }
  }

  // Difficulty Tier
  if (input.difficulty_tier !== undefined) {
    if (!validDifficultyTiers.includes(input.difficulty_tier)) {
      errors.push({
        field: "difficulty_tier",
        message: `Difficulty tier must be one of: ${validDifficultyTiers.join(", ")}`,
      });
    }
  }

  // Frequency
  if (input.frequency !== undefined) {
    if (!validFrequencies.includes(input.frequency)) {
      errors.push({
        field: "frequency",
        message: `Frequency must be one of: ${validFrequencies.join(", ")}`,
      });
    }
  }

  // Target Waterings
  if (input.target_waterings !== undefined) {
    if (!isInteger(input.target_waterings)) {
      errors.push({ field: "target_waterings", message: "Target waterings must be an integer" });
    } else if (input.target_waterings <= 0) {
      errors.push({ field: "target_waterings", message: "Target waterings must be positive" });
    }
  }

  // Current Waterings
  if (input.current_waterings !== undefined) {
    if (!isInteger(input.current_waterings)) {
      errors.push({ field: "current_waterings", message: "Current waterings must be an integer" });
    } else if (input.current_waterings < 0) {
      errors.push({ field: "current_waterings", message: "Current waterings cannot be negative" });
    }
  }

  // Wither Threshold
  if (input.wither_threshold !== undefined) {
    if (!isInteger(input.wither_threshold)) {
      errors.push({ field: "wither_threshold", message: "Wither threshold must be an integer" });
    } else if (input.wither_threshold <= 0) {
      errors.push({ field: "wither_threshold", message: "Wither threshold must be positive" });
    }
  }

  // Consecutive Misses
  if (input.consecutive_misses !== undefined) {
    if (!isInteger(input.consecutive_misses)) {
      errors.push({
        field: "consecutive_misses",
        message: "Consecutive misses must be an integer",
      });
    } else if (input.consecutive_misses < 0) {
      errors.push({
        field: "consecutive_misses",
        message: "Consecutive misses cannot be negative",
      });
    }
  }

  // Wither Count
  if (input.wither_count !== undefined) {
    if (!isInteger(input.wither_count)) {
      errors.push({ field: "wither_count", message: "Wither count must be an integer" });
    } else if (input.wither_count < 0) {
      errors.push({ field: "wither_count", message: "Wither count cannot be negative" });
    }
  }

  // Status
  if (input.status !== undefined) {
    if (!validStatuses.includes(input.status)) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }
  }

  // Is Public
  if (input.is_public !== undefined) {
    if (typeof input.is_public !== "boolean") {
      errors.push({ field: "is_public", message: "Is public must be a boolean" });
    }
  }

  // Hide Name
  if (input.hide_name !== undefined) {
    if (typeof input.hide_name !== "boolean") {
      errors.push({ field: "hide_name", message: "Hide name must be a boolean" });
    }
  }

  // Hide Description
  if (input.hide_description !== undefined) {
    if (typeof input.hide_description !== "boolean") {
      errors.push({ field: "hide_description", message: "Hide description must be a boolean" });
    }
  }

  // Share Name Friends
  if (input.share_name_friends !== undefined && input.share_name_friends !== null) {
    if (
      !Array.isArray(input.share_name_friends) ||
      !input.share_name_friends.every((item: any) => typeof item === "string")
    ) {
      errors.push({
        field: "share_name_friends",
        message: "share_name_friends must be an array of strings",
      });
    }
  }

  // Share Description Friends
  if (input.share_desc_friends !== undefined && input.share_desc_friends !== null) {
    if (
      !Array.isArray(input.share_desc_friends) ||
      !input.share_desc_friends.every((item: any) => typeof item === "string")
    ) {
      errors.push({
        field: "share_desc_friends",
        message: "share_desc_friends must be an array of strings",
      });
    }
  }

  // Current Streak
  if (input.current_streak !== undefined) {
    if (!isInteger(input.current_streak)) {
      errors.push({ field: "current_streak", message: "Current streak must be an integer" });
    } else if (input.current_streak < 0) {
      errors.push({ field: "current_streak", message: "Current streak cannot be negative" });
    }
  }

  // Max Streak
  if (input.max_streak !== undefined) {
    if (!isInteger(input.max_streak)) {
      errors.push({ field: "max_streak", message: "Max streak must be an integer" });
    } else if (input.max_streak < 0) {
      errors.push({ field: "max_streak", message: "Max streak cannot be negative" });
    }
  }

  // Flexible Rules
  if (input.flexible_rules !== undefined && input.flexible_rules !== null) {
    const rules = input.flexible_rules;
    if (typeof rules !== "object") {
      errors.push({ field: "flexible_rules", message: "Flexible rules must be an object" });
    } else {
      const { days_required, days_total } = rules;
      if (!isInteger(days_required)) {
        errors.push({
          field: "flexible_rules.days_required",
          message: "Flexible rules days_required must be an integer",
        });
      } else if (days_required <= 0) {
        errors.push({
          field: "flexible_rules.days_required",
          message: "Flexible rules days_required must be positive",
        });
      }

      if (!isInteger(days_total)) {
        errors.push({
          field: "flexible_rules.days_total",
          message: "Flexible rules days_total must be an integer",
        });
      } else if (days_total <= 0) {
        errors.push({
          field: "flexible_rules.days_total",
          message: "Flexible rules days_total must be positive",
        });
      }

      if (isInteger(days_required) && isInteger(days_total) && days_required > days_total) {
        errors.push({
          field: "flexible_rules",
          message: "Flexible rules days_required cannot exceed days_total",
        });
      }
    }
  }

  // Cross-field validations if both are present
  if (input.current_waterings !== undefined && input.target_waterings !== undefined) {
    if (isInteger(input.current_waterings) && isInteger(input.target_waterings)) {
      if (input.current_waterings > input.target_waterings) {
        errors.push({
          field: "current_waterings",
          message: "Current waterings cannot exceed target waterings",
        });
      }
    }
  }

  if (input.current_streak !== undefined && input.max_streak !== undefined) {
    if (isInteger(input.current_streak) && isInteger(input.max_streak)) {
      if (input.current_streak > input.max_streak) {
        errors.push({
          field: "current_streak",
          message: "Current streak cannot exceed max streak",
        });
      }
    }
  }
}

export function validateCreateHabitInput(input: any): ValidationResult<CreateHabitInput> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: [{ field: "input", message: "Input must be a valid object" }],
    };
  }

  // User ID (Required)
  if (input.user_id === undefined || input.user_id === null) {
    errors.push({ field: "user_id", message: "User ID is required" });
  } else if (typeof input.user_id !== "string") {
    errors.push({ field: "user_id", message: "User ID must be a string" });
  } else if (!uuidRegex.test(input.user_id)) {
    errors.push({ field: "user_id", message: "User ID must be a valid UUID" });
  }

  // Name (Required)
  if (input.name === undefined || input.name === null) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (typeof input.name !== "string") {
    errors.push({ field: "name", message: "Name must be a string" });
  } else {
    const trimmed = input.name.trim();
    if (trimmed.length === 0) {
      errors.push({ field: "name", message: "Name cannot be empty" });
    } else if (trimmed.length > 100) {
      errors.push({ field: "name", message: "Name must be 100 characters or less" });
    }
  }

  // Common field checks
  validateCommonFields(input, errors);

  // Flexible frequency rule: if frequency is flexible, flexible_rules must be present and non-null
  if (input.frequency === "flexible") {
    if (input.flexible_rules === undefined || input.flexible_rules === null) {
      errors.push({
        field: "flexible_rules",
        message: "Flexible rules are required when frequency is flexible",
      });
    }
  } else if (
    input.frequency !== undefined &&
    input.flexible_rules !== undefined &&
    input.flexible_rules !== null
  ) {
    errors.push({
      field: "flexible_rules",
      message: "Flexible rules should be null when frequency is not flexible",
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: input as CreateHabitInput,
  };
}

export function validateUpdateHabitInput(input: any): ValidationResult<UpdateHabitInput> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: [{ field: "input", message: "Input must be a valid object" }],
    };
  }

  // Name (Optional)
  if (input.name !== undefined) {
    if (typeof input.name !== "string") {
      errors.push({ field: "name", message: "Name must be a string" });
    } else {
      const trimmed = input.name.trim();
      if (trimmed.length === 0) {
        errors.push({ field: "name", message: "Name cannot be empty" });
      } else if (trimmed.length > 100) {
        errors.push({ field: "name", message: "Name must be 100 characters or less" });
      }
    }
  }

  // Common field checks
  validateCommonFields(input, errors);

  // Poetic Summary (Optional)
  if (input.poetic_summary !== undefined && input.poetic_summary !== null) {
    if (typeof input.poetic_summary !== "string") {
      errors.push({ field: "poetic_summary", message: "Poetic summary must be a string" });
    }
  }

  // Completed At (Optional)
  if (input.completed_at !== undefined && input.completed_at !== null) {
    if (typeof input.completed_at !== "string") {
      errors.push({ field: "completed_at", message: "Completed at must be a string" });
    } else {
      const date = Date.parse(input.completed_at);
      if (isNaN(date)) {
        errors.push({
          field: "completed_at",
          message: "Completed at must be a valid ISO Date string",
        });
      }
    }
  }

  // Cross field checks for frequency & rules updates:
  if (input.frequency === "flexible" && input.flexible_rules === null) {
    errors.push({
      field: "flexible_rules",
      message: "Flexible rules cannot be null when frequency is flexible",
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: input as UpdateHabitInput,
  };
}
