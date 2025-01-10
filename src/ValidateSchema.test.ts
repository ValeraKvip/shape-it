import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest'
import { defaultSchema, ModelManager, RootModels, Schema } from './Schema';
import { validateSchema } from './ValidateSchema';
import {
    ARRAY_CONSTRAIN_FOR_NON_ARRAY_PROP, ARRAY_CONSTRAINS_MAX_MIN_ARE_EQUAL,
    ARRAY_LENGTH_CONSTRAIN_IS_NEGATIVE_OR_ZERO, ARRAY_LENGTH_CONSTRAIN_IS_NOT_INTEGER,
    ARRAY_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO, ARRAY_MAX_CONSTRAIN_IS_NOT_INTEGER,
    ARRAY_MIN_AND_OPTIONAL_ARE_USED,
    ARRAY_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO, ARRAY_MIN_CONSTRAIN_IS_NOT_INTEGER,
    ARRAY_MIN_GREATER_MAX_CONSTRAIN, ARRAY_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH,
    FLOAT_CONSTRAINS_MAX_MIN_ARE_EQUAL, FLOAT_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO,
    FLOAT_MAX_CONSTRAIN_IS_NOT_INTEGER, FLOAT_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO,
    FLOAT_MIN_CONSTRAIN_IS_NOT_INTEGER, FLOAT_MIN_GREATER_MAX_CONSTRAIN,
    INT_CONSTRAINS_MAX_MIN_ARE_EQUAL, INT_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO,
    INT_MAX_CONSTRAIN_IS_NOT_INTEGER, INT_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO,
    INT_MIN_CONSTRAIN_IS_NOT_INTEGER, INT_MIN_GREATER_MAX_CONSTRAIN,
    MODEL_IS_EMPTY, SITEMAP_DOMAIN_LOST, SITEMAP_MODEL_CHANGEFREQ_WRONG,
    STRING_CONSTRAINS_MAX_MIN_ARE_EQUAL, STRING_LOWERCASE_USED_WITH_UPPERCASE,
    STRING_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO, STRING_MAX_CONSTRAIN_IS_NOT_INTEGER,
    STRING_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO, STRING_MIN_CONSTRAIN_IS_NOT_INTEGER,
    STRING_MIN_GREATER_MAX_CONSTRAIN, STRING_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH
} from './errors';
let term = require('terminal-kit').terminal;
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalTerm = term
beforeAll(() => {
    console.log = () => { };
    console.error = () => { };
    console.warn = () => { };
    term = () => { };
})

afterAll(() => {
    // Restore console.log after tests
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    term = originalTerm;
});

describe('model', () => {
    it("Forbid empty models", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(MODEL_IS_EMPTY);
    })
});

describe('sitemap', () => {
    it("$sitemap should contain 'domain' property", async () => {
        const schema = {
            ...defaultSchema, ...{
                $sitemap:{
                    sMaxAge:500
                },
                book: {
                    $id: {
                        type: 'string'
                    },

                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(SITEMAP_DOMAIN_LOST);
    })

    it("$sitemap 'changefreq' contains only allowed params", async () => {
        const allowed = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never',];
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },
                    $sitemap: {
                        changefreq: 'wrong'
                    },
                    x: {
                        type: 'string',
                    }

                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(SITEMAP_MODEL_CHANGEFREQ_WRONG);

        for (const value of allowed) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },
                        $sitemap: {
                            changefreq: value
                        },
                        x: {
                            type: 'string',
                        }

                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(0);
        }
    })
});

describe('array', () => {
    it("The 'min' and 'max' properties of the array cannot be declared alongside the 'length' property", async () => {
        const schema = {
            ...getDefaultSchema(),
            ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    arr: {
                        type: 'string[]',
                        array: {
                            max: 10,
                            min: 2,
                            length: 5
                        }
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(ARRAY_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH);

        const schema2 = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    arr: {
                        type: 'string[]',
                        array: {
                            max: 10,

                            length: 5
                        }
                    }
                }
            }
        } as any as Schema;
        const models2 = generateModels(schema2);
        expect(validateSchema(models2, schema2)).toBe(ARRAY_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH);


        const schema3 = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    arr: {
                        type: 'string[]',
                        array: {

                            min: 2,
                            length: 5
                        }
                    }
                }
            }
        } as any as Schema;
        const models3 = generateModels(schema3);
        expect(validateSchema(models3, schema3)).toBe(ARRAY_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH);
    })

    it("Forbid array constrain for non-array property", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    arr: {
                        type: 'string',
                        array: {
                            max: 10,
                            min: 20,
                        }
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(ARRAY_CONSTRAIN_FOR_NON_ARRAY_PROP);

    })

    it("Array properties min cannot be greater then max", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    arr: {
                        type: 'string[]',
                        array: {
                            max: 10,
                            min: 20,
                        }
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(ARRAY_MIN_GREATER_MAX_CONSTRAIN);
    })

    it("Array 'length' property cannot be zero", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    arr: {
                        type: 'string[]',
                        array: {
                            length: 0
                        }
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(ARRAY_LENGTH_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
    })

    it("Array 'length' property cannot be less then zero", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    arr: {
                        type: 'string[]',
                        array: {
                            length: -1
                        }
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(ARRAY_LENGTH_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
    })

    it("Array 'max' property cannot be less then zero", async () => {
        const values = [-1, 0];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        arr: {
                            type: 'string[]',
                            array: {
                                min: -2,
                                max: value
                            }
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(ARRAY_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
        }
    })

    it("Array 'max' property cannot be less then zero", async () => {
        const values = [-1, -5, -20];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        arr: {
                            type: 'string[]',
                            array: {
                                min: value,

                            }
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(ARRAY_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
        }
    })


    it("Array 'length' property has to be an integer", async () => {
        const values = [0.1, 2.5, 25.8, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        arr: {
                            type: 'string[]',
                            array: {
                                length: value
                            }
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(ARRAY_LENGTH_CONSTRAIN_IS_NOT_INTEGER);
        }
    })

    it("Array 'max' property has to be an integer", async () => {
        const values = [1.1, 2.5, 25.8, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        arr: {
                            type: 'string[]',
                            array: {
                                max: value
                            }
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(ARRAY_MAX_CONSTRAIN_IS_NOT_INTEGER);
        }

    })

    it("Array 'min' property has to be an integer", async () => {
        const values = [1.1, 2.5, 25.8, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        arr: {
                            type: 'string[]',
                            array: {
                                min: value
                            }
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(ARRAY_MIN_CONSTRAIN_IS_NOT_INTEGER);
        }

    })

    it("Array forbid max === min", async () => {
        const values = [1, 25, 77, 500, 19856];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        arr: {
                            type: 'string[]',
                            array: {
                                max: value,
                                min: value
                            }
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(ARRAY_CONSTRAINS_MAX_MIN_ARE_EQUAL);
        }
    })


    it("Array cannot combine optional and min > 0", async () => {
        const values = [1, 25, 77, 500, 19856];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        arr: {
                            type: 'string[]',
                            optional:true,
                            array: {
                                max: 50000,
                                min: value
                            }
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(ARRAY_MIN_AND_OPTIONAL_ARE_USED);
        }
    })
})

describe('string', () => {
    it("The 'min' and 'max' properties of the string cannot be declared alongside the 'length' property", async () => {
        const schema = {
            ...getDefaultSchema(),
            ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    str: {
                        type: 'string',
                        max: 10,
                        min: 2,
                        length: 5
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(STRING_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH);

        const schema2 = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    str: {
                        type: 'string',
                        max: 10,
                        length: 5
                    }
                }
            }
        } as any as Schema;
        const models2 = generateModels(schema2);
        expect(validateSchema(models2, schema2)).toBe(STRING_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH);


        const schema3 = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    str: {
                        type: 'string',
                        min: 2,
                        length: 5
                    }
                }
            }
        } as any as Schema;
        const models3 = generateModels(schema3);
        expect(validateSchema(models3, schema3)).toBe(STRING_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH);
    })


    it("string forbid max === min", () => {
        const values = [1, 25, 77, 500, 19856];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    game: {
                        $id: {
                            type: 'string'
                        },

                        str: {
                            type: 'string',
                            max: value,
                            min: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(STRING_CONSTRAINS_MAX_MIN_ARE_EQUAL);
        }
    })

    it("min constrain cannot be greater then max", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    str: {
                        type: 'string',
                        max: 10,
                        min: 20,
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(STRING_MIN_GREATER_MAX_CONSTRAIN);
    })

    it("Forbid using 'toLowerCase' and 'toUpperCase' simultaneously", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    str: {
                        type: 'string',
                        toLowerCase: true,
                        toUpperCase: true,
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(STRING_LOWERCASE_USED_WITH_UPPERCASE);
    })

    it("String 'max' property cannot be less then zero", async () => {
        const values = [-1, 0];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        str: {
                            type: 'string',
                            min: -100,
                            max: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(STRING_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
        }
    })

    it("String 'max' property has to be an integer", async () => {
        const values = [1.1, 5.2, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        str: {
                            type: 'string',
                            max: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(STRING_MAX_CONSTRAIN_IS_NOT_INTEGER);
        }
    })

    it("String 'min' property cannot be less then zero", async () => {
        const values = [-1, 0];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        str: {
                            type: 'string',
                            min: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(STRING_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
        }
    })

    it("String 'max' property has to be an integer", async () => {
        const values = [1.1, 5.2, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        str: {
                            type: 'string',
                            min: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(STRING_MIN_CONSTRAIN_IS_NOT_INTEGER);
        }
    })



});


describe('number&float', () => {
    it("string forbid max === min", () => {
        const values = [1, 25, 77, 500, 19856];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    float: {
                        $id: {
                            type: 'string'
                        },

                        float: {
                            type: 'float',
                            max: value,
                            min: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(FLOAT_CONSTRAINS_MAX_MIN_ARE_EQUAL);
        }
    })

    it("min constrain cannot be greater then max", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    float: {
                        type: 'float',
                        max: 10,
                        min: 20,
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(FLOAT_MIN_GREATER_MAX_CONSTRAIN);
    })

    // it("float 'max' property cannot be less then zero", async () => {
    //     const values = [-1, 0];
    //     for (const value of values) {
    //         const schema = {
    //             ...getDefaultSchema(), ...{
    //                 book: {
    //                     $id: {
    //                         type: 'string'
    //                     },

    //                     float: {
    //                         type: 'float',
    //                         min: -100,
    //                         max: value
    //                     }
    //                 }
    //             }
    //         } as any as Schema;
    //         const models = generateModels(schema);
    //         expect(validateSchema(models, schema)).toBe(FLOAT_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
    //     }
    // })

    it("float 'max' property has to be an integer", async () => {
        const values = [1.1, 5.2, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        float: {
                            type: 'float',
                            max: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(FLOAT_MAX_CONSTRAIN_IS_NOT_INTEGER);
        }
    })

    // it("float 'min' property cannot be less then zero", async () => {
    //     const values = [-1, 0];
    //     for (const value of values) {
    //         const schema = {
    //             ...getDefaultSchema(), ...{
    //                 book: {
    //                     $id: {
    //                         type: 'string'
    //                     },

    //                     float: {
    //                         type: 'float',
    //                         min: value
    //                     }
    //                 }
    //             }
    //         } as any as Schema;
    //         const models = generateModels(schema);
    //         expect(validateSchema(models, schema)).toBe(FLOAT_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
    //     }
    // })

    it("float 'max' property has to be an integer", async () => {
        const values = [1.1, 5.2, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        float: {
                            type: 'float',
                            min: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(FLOAT_MIN_CONSTRAIN_IS_NOT_INTEGER);
        }
    })
});



describe('int', () => {
    it("int forbid max === min", () => {
        const values = [1, 25, 77, 500, 19856];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    float: {
                        $id: {
                            type: 'string'
                        },

                        int: {
                            type: 'int',
                            max: value,
                            min: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(INT_CONSTRAINS_MAX_MIN_ARE_EQUAL);
        }
    })

    it("min constrain cannot be greater then max", async () => {
        const schema = {
            ...getDefaultSchema(), ...{
                book: {
                    $id: {
                        type: 'string'
                    },

                    int: {
                        type: 'int',
                        max: 10,
                        min: 20,
                    }
                }
            }
        } as any as Schema;
        const models = generateModels(schema);
        expect(validateSchema(models, schema)).toBe(INT_MIN_GREATER_MAX_CONSTRAIN);
    })

    // it("int 'max' property cannot be less then zero", async () => {
    //     const values = [-1, 0];
    //     for (const value of values) {
    //         const schema = {
    //             ...getDefaultSchema(), ...{
    //                 book: {
    //                     $id: {
    //                         type: 'string'
    //                     },

    //                     int: {
    //                         type: 'int',
    //                         min: -100,
    //                         max: value
    //                     }
    //                 }
    //             }
    //         } as any as Schema;
    //         const models = generateModels(schema);
    //         expect(validateSchema(models, schema)).toBe(INT_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
    //     }
    // })

    it("int 'max' property has to be an integer", async () => {
        const values = [1.1, 5.2, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        int: {
                            type: 'int',
                            max: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(INT_MAX_CONSTRAIN_IS_NOT_INTEGER);
        }
    })

    // it("int 'min' property cannot be less then zero", async () => {
    //     const values = [-1, 0];
    //     for (const value of values) {
    //         const schema = {
    //             ...getDefaultSchema(), ...{
    //                 book: {
    //                     $id: {
    //                         type: 'string'
    //                     },

    //                     int: {
    //                         type: 'int',
    //                         min: value
    //                     }
    //                 }
    //             }
    //         } as any as Schema;
    //         const models = generateModels(schema);
    //         expect(validateSchema(models, schema)).toBe(INT_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO);
    //     }
    // })

    it("int 'max' property has to be an integer", async () => {
        const values = [1.1, 5.2, 77.9];
        for (const value of values) {
            const schema = {
                ...getDefaultSchema(), ...{
                    book: {
                        $id: {
                            type: 'string'
                        },

                        int: {
                            type: 'int',
                            min: value
                        }
                    }
                }
            } as any as Schema;
            const models = generateModels(schema);
            expect(validateSchema(models, schema)).toBe(INT_MIN_CONSTRAIN_IS_NOT_INTEGER);
        }
    })
});

function getDefaultSchema() {
    return {
        ...defaultSchema,
        ...{
            $sitemap: {
                domain: 'xxx',
                maxAge: 86400,
                sMaxAge: 86400
            }
        },
    }
}

function generateModels(schema: Schema) {
    const models = {}
    for (let key in schema) {
        if (key[0] !== '$') {
            models[key] = new ModelManager(schema[key], String(key), models);
        }
    }

    return models;
}