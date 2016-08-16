from itertools import product

def get_accessors(definition, accessors):
    if isinstance(definition, dict):
        output = []
        for key, value in definition.items():
            output.append(get_accessors(value, accessors + [key]))
        return output
    else:
        return accessors

def flatten(array):
    output = []
    def dive(array):
        if not isinstance(array[0], list):
            output.append(array)
        else:
            for value in array:
                dive(value)

    dive(array)
    return output

# generate all possible combinations of parameters
# it supports parameters nested in dictionary properties
def generate_parameters(definition):
    accessors = flatten(get_accessors(definition, []))
    def accessor_to_value(accessor):
        value = definition
        for acc in accessor:
            value = value[acc]

        return value

    def combination_to_output(combination):
        output = {}
        for accessor, value in zip(accessors, combination):
            obj = output
            for i in range(len(accessor) - 1):
                if not accessor[i] in obj:
                    obj[accessor[i]] = {}
                obj = obj[accessor[i]]

            obj[accessor[-1]] = value

        return output

    values = list(map(accessor_to_value, accessors))
    combinations = product(*values)

    output = list(map(combination_to_output, combinations))

    return output
