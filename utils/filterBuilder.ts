import { FilterItem } from "../controllers/interface";
import { AppError } from "../service/asyncHandler";

export const buildFilterPipeline = (filters: FilterItem[]): any[] => {
  const pipelineStages: any[] = [];

  if (!filters || filters.length === 0) {
    return pipelineStages;
  }

  filters.forEach((filter) => {
    const filterQuery: any = {};
    const { field, operator, value } = filter;

    if (!["likesCount", "commentsCount", "caption"].includes(field)) {
      throw new AppError(`Invalid field: ${field}`, 400);
    }

    switch (operator) {
      case "=":
        filterQuery[field] = { $eq: value };
        break;
      case "!=":
        filterQuery[field] = { $ne: value };
        break;
      case ">":
        filterQuery[field] = { $gt: value };
        break;
      case ">=":
        filterQuery[field] = { $gte: value };
        break;
      case "<":
        filterQuery[field] = { $lt: value };
        break;
      case "<=":
        filterQuery[field] = { $lte: value };
        break;

      case "contains":
        filterQuery[field] = { $regex: value, $options: "i" };
        break;
      case "doesNotContain":
        filterQuery[field] = { $not: { $regex: value, $options: "i" } };
        break;
      case "startsWith":
        filterQuery[field] = {
          $regex: `^${escapeRegex(value as string)}`,
          $options: "i",
        };
        break;
      case "endsWith":
        filterQuery[field] = {
          $regex: `${escapeRegex(value as string)}$`,
          $options: "i",
        };
        break;
      case "equals":
        filterQuery[field] = { $eq: value };
        break;
      case "doesNotEqual":
        filterQuery[field] = { $ne: value };
        break;

      default:
        throw new AppError(`Invalid operator: ${operator}`, 400);
    }

    if (Object.keys(filterQuery).length > 0) {
      pipelineStages.push({ $match: filterQuery });
    }
  });

  return pipelineStages;
};

export const parseFilters = (filtersString?: string): FilterItem[] => {
  if (!filtersString) {
    return [];
  }

  try {
    const decodedFilters = decodeURIComponent(filtersString);
    const parsedFilters = JSON.parse(decodedFilters);

    if (!Array.isArray(parsedFilters)) {
      throw new AppError("Filters must be an array", 400);
    }

    parsedFilters.forEach((filter, index) => {
      if (!filter.field || !filter.operator || filter.value === undefined) {
        throw new AppError(
          `Invalid filter at index ${index}: missing field, operator, or value`,
          400
        );
      }
    });

    return parsedFilters;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid filters format", 400);
  }
};

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const validateFilters = (filters: FilterItem[]): void => {
  filters.forEach((filter) => {
    const { field, operator, value } = filter;

    if (["likesCount", "commentsCount"].includes(field)) {
      const numericOperators = ["=", "!=", ">", ">=", "<", "<="];
      if (!numericOperators.includes(operator)) {
        throw new AppError(
          `Operator '${operator}' is not valid for numeric field '${field}'`,
          400
        );
      }
      if (typeof value !== "number") {
        throw new AppError(`Value for field '${field}' must be a number`, 400);
      }
    }

    if (field === "caption") {
      const textOperators = [
        "contains",
        "doesNotContain",
        "startsWith",
        "endsWith",
        "equals",
        "doesNotEqual",
      ];
      if (!textOperators.includes(operator)) {
        throw new AppError(
          `Operator '${operator}' is not valid for text field '${field}'`,
          400
        );
      }
      if (typeof value !== "string") {
        throw new AppError(`Value for field '${field}' must be a string`, 400);
      }
    }
  });
};
