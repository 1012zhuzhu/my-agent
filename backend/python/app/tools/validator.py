from jsonschema import validate
from jsonschema.exceptions import ValidationError


class SchemaValidator:
    def validate(self, schema: dict, args: dict):
        try:
            validate(instance=args, schema=schema)
            return {
                "success": True,
                "error": None
            }
        except ValidationError as e:
            return {
                "success": False,
                "error": e.message
            }