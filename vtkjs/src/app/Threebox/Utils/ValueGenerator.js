const ValueGenerator = function(input) {
    if(typeof input === 'object' && input.property !== undefined)    // Value name comes from a property in each item
        return (f => f.properties[input.property]);
    else if(typeof input === 'object' && input.generator !== undefined)   // Value name generated by a function run on each item
        return input.generator;
    else return (() => input);

    return undefined;
}

export default ValueGenerator;
