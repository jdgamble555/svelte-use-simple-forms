import { getContext, hasContext, setContext } from "svelte";
import { get, writable, type Writable } from "svelte/store";

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

export const useSimpleForm = (name = 'form') => {

    const { node, data } = getFormContext(name);

    return {

        simple: (_node: HTMLFormElement) => {

            node.set(_node);

            const onNodeInput = (event: Event) => {
                
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

            _node.addEventListener('input', onNodeInput);

            return {
                destory: () => {
                    _node.removeEventListener('input', onNodeInput);
                }
            }

        },
        reset: () => node.update((node) => {
            node.reset();
            return node;
        }),
        data,
        customValidator: (
            element: AllFormElements,
            callback: (
                el: AllFormElements,
                data: Record<string, string>
            ) => string | null
        ) => {

            const oninput = () => {
                const _data = getFormValues(get(node));
                const valid = callback(element, _data);
                if (valid && !element.validationMessage) {
                    element.setCustomValidity(valid);
                } else {
                    element.setCustomValidity('');
                }
            };

            element.addEventListener('input', oninput);

            return {
                update: () => { },
                destory: () => {
                    element.removeEventListener('input', oninput);
                }
            }
        }
    }
};

const getFormValues = (node: HTMLFormElement) => {
    const values: Record<string, string> = {};
    for (let i = 0; i < node.elements.length; ++i) {
        const element = node.elements[i] as AllFormElements;

        // only form control elements
        if (
            !element.name
            || element.type === 'reset'
            || element.type === 'submit'
        ) {
            continue;
        }
        values[element.name] = element.value;
    }
    return values;
};

const getFormElements = (node: HTMLFormElement, name: string) => {
    const values: Record<string, string> = {};
    const touched: string[] = [];
    const valid: string[] = [];
    const errors: Record<string, { state: string; message: string }[]> = {};


    for (let i = 0; i < node.elements.length; ++i) {
        const element = node.elements[i] as AllFormElements;

        // only form control elements
        if (
            !element.name
            || element.type === 'reset'
            || element.type === 'submit'
        ) {
            continue;
        }

        values[element.name] = element.value;

        // touched
        if (element.hasAttribute(`data-touched-${name}`)) {
            touched.push(element.name);
        }

        // validity
        if (element.validity.valid) {
            valid.push(element.name);
            continue;
        }

        const errorMessages = validityStates
            .filter(state => element.validity[state as keyof ValidityState])
            .map(state => ({
                state,
                message: element.validationMessage
            }));

        if (errorMessages.length > 0) {
            errors[element.name] = errorMessages;
        }
    }

    // form state
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





