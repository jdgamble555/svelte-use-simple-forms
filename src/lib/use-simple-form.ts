import { getContext, hasContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

export type AllFormElements = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type SimpleForm = {
    values: Record<string, string>,
    touched: string[],
    valid: string[],
    errors: Record<string, {
        state: string;
        message: string
    }[]>,
    state: {
        touched: boolean,
        valid: boolean
    }
};

export const useSimpleForm = (name = 'form') => {

    const { node, data } = getFormContext(name);

    return {

        simple: (_node: HTMLFormElement) => {
            node.set(_node);

            _node.oninput = (event: Event) => {

                const targetElement = event.target as AllFormElements;

                if (targetElement.hasAttribute('data-simple-form-ignore')) {
                    return;
                }

                targetElement.setAttribute(`data-touched-${name}`, '');

                const { values, touched, valid, errors, state } = getFormElements(_node, name);
                data.set({
                    values,
                    touched,
                    valid,
                    errors,
                    state
                });
            };

        },
        reset: () => node.update((node) => {
            node.reset();
            return node;
        }),
        data,
        customValidator: (
            element: AllFormElements,
            callback: (el: AllFormElements) => string | null
        ) => {
            element.oninput = () => {
                const valid = callback(element);
                if (valid && !element.validationMessage) {
                    element.setCustomValidity(valid);
                } else {
                    element.setCustomValidity('');
                }
            };
        }
    }
};

// check validity without calling verifiy?

const getFormElements = (node: HTMLFormElement, name: string) => {
    const values: Record<string, string> = {};
    const touched: string[] = [];
    const valid: string[] = [];
    const errors: Record<string, { state: string; message: string }[]> = {};

    const validityStates = [
        'badInput',
        'customError',
        'patternMismatch',
        'rangeOverflow',
        'rangeUnderflow',
        'stepMismatch',
        'tooLong',
        'tooShort',
        'typeMismatch',
        'valid',
        'valueMissing'
    ];

    for (let i = 0; i < node.elements.length; ++i) {
        const element = node.elements[i] as AllFormElements;

        // form elements
        if (element.name) {
            if (
                element.type !== 'submit'
                && element.type !== 'reset'
                && element.name
            ) {
                values[element.name] = element.value;
            }

            // validity
            if (element.validity.valid) {
                valid.push(element.name);
            } else {
                const errorMessages = validityStates
                    .filter(state => element.validity[state as keyof ValidityState])
                    .map(state => ({
                        state,
                        message: element.validationMessage,
                    }));

                if (errorMessages.length > 0) {
                    errors[element.name] = errorMessages;
                }
            }

            if (element.hasAttribute(`data-touched-${name}`)) {
                touched.push(element.name);
            }
        }
    }

    const state = {
        touched: touched.length > 0,
        valid: Object.keys(values).length === Object.keys(valid).length
    };

    return { values, touched, valid, errors, state };
};


const getFormContext = (name: string) => {

    type FormContext = {
        node: Writable<HTMLFormElement>;
        data: Writable<SimpleForm>
    };

    if (hasContext(name)) {
        return getContext<FormContext>(name);
    }
    const context: FormContext = {
        node: writable(),
        data: writable(),
    };
    setContext(name, context);

    return context;
};





