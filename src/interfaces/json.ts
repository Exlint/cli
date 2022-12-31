type JsonArray = Array<JsonValue>;

type JsonObject = { [Key in string]?: JsonValue };

export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;
