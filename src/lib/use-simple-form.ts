import { browser } from "$app/environment";
import { getContext, hasContext, setContext } from "svelte";
import { get, writable, type Writable } from "svelte/store";

const TOUCHED = 'data-touched';
const IGNORE = 'data-ignore';

export type FormDataElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

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

const validityStates: (keyof ValidityState)[] = [
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


// TODO - look into error being object not array - 1
// TODO - only validate touched controls - 2
// TODO - figure out chips input - 3
// TODO - save intitial form state - 4

// TODO - add optional to non-required fields (opt.)

export const useSimpleForm = (name = 'form') => {

    const { node, data, validity } = getFormContext(name);

    return {

        simple: (_node: HTMLFormElement) => {

            let onNodeInput: (event: Event) => void;
            let onFormSumbit: (event: Event) => void;

            if (browser) {

                // manually handle validation before submit
                _node.setAttribute('novalidate', '');

                node.set(_node);

                onFormSumbit = (event: Event) => {
                    event.preventDefault();
                    setAllTouched(_node);
                    if (!_node.reportValidity()) {
                        return false;
                    }
                    removeAllTouched(_node);
                };

                onNodeInput = (event: Event) => {

                    // check custom validators
                    for (const validatorFunction of get(validity)) {
                        validatorFunction();
                    }

                    const targetElement = event.target as FormDataElement;

                    targetElement.setAttribute(TOUCHED, '');

                    if (targetElement.hasAttribute(IGNORE)) {
                        return;
                    }

                    const { values, touched, valid, errors, state } = getFormElements(_node);
                    data.set({
                        values,
                        touched,
                        valid,
                        errors,
                        state
                    });
                };
                _node.addEventListener('submit', onFormSumbit);
                _node.addEventListener('input', onNodeInput);
            }

            return {
                update: () => { },
                destory: () => {
                    if (browser) {
                        _node.removeEventListener('input', onNodeInput);
                        _node.removeEventListener('submit', onFormSumbit);
                    }

                }
            }
        },
        reset: () => get(node).reset(),
        data,
        customValidator: (
            element: FormDataElement,
            callback: (
                targetElement: FormDataElement,
                data: Record<string, string>
            ) => string | null
        ) => {
            const onElementInput = () => {
                // input oninput event ran before form oninput event
                const formElements = getFormDataElements(get(node));
                const formValues = getFormValues(formElements);
                const valid = callback(element, formValues);
                if (valid && !element.validationMessage) {
                    element.setCustomValidity(valid);
                    return;
                }
                element.setCustomValidity('');
            };
            validity.update((fn) => (fn.push(onElementInput), fn));
        }
    }
};

const getFormContext = (name: string) => {

    type FormContext = {
        node: Writable<HTMLFormElement>;
        data: Writable<SimpleForm>;
        validity: Writable<Array<() => void>>
    };

    if (hasContext(name)) {
        return getContext<FormContext>(name);
    }
    const context: FormContext = {
        node: writable(),
        data: writable(),
        validity: writable([])
    };
    setContext(name, context);

    return context;
};

const setAllTouched = (node: HTMLFormElement) => {
    const formDataElements = getFormDataElements(node);
    for (const element of formDataElements) {
        element.setAttribute(TOUCHED, '');
    }
};

const removeAllTouched = (node: HTMLFormElement) => {
    const formDataElements = getFormDataElements(node);
    for (const element of formDataElements) {
        element.removeAttribute(TOUCHED);
    }
};

const getFormValues = (formDataElements: FormDataElement[]) => {
    const values: Record<string, string> = {};
    for (const element of formDataElements) {
        values[element.name] = element.value;
    }
    return values;
};

const getFormElements = (node: HTMLFormElement) => {

    const formDataElements = getFormDataElements(node);
    const values = getFormValues(formDataElements);
    const touched = getTouchedElementNames(formDataElements);
    const { errors, valid } = getFormElementsValidity(formDataElements);

    const state = {
        touched: touched.length > 0,
        valid: Object.keys(values).length === Object.keys(valid).length
    };
    return { values, touched, valid, errors, state };
};

const isFormDataElement = (element: Element): element is FormDataElement => {
    return element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement;
};

const getFormDataElements = (node: HTMLFormElement): FormDataElement[] => {
    const dataElements: FormDataElement[] = [];
    for (const element of node.elements) {
        if (
            isFormDataElement(element)
            && !element.hasAttribute(IGNORE)
            && element.name
        ) {
            dataElements.push(element);
        }
    }
    return dataElements;
}

const getTouchedElementNames = (formDataElements: FormDataElement[]) => {
    const touched = [];
    for (const element of formDataElements) {
        if (element.hasAttribute(TOUCHED)) {
            touched.push(element.name);
        }
    }
    return touched;
};

const getFormElementsValidity = (formDataElements: FormDataElement[]) => {

    type ErrorValidity = Record<string, { state: string; message: string }[]>;

    const valid: string[] = [];
    const errors: ErrorValidity = {};

    for (const element of formDataElements) {
        if (element.validity.valid) {
            valid.push(element.name);
            continue;
        }
        const elementErrors: { state: string; message: string }[] = [];

        for (const state of validityStates) {
            if (element.validity[state]) {
                elementErrors.push({
                    state,
                    message: element.validationMessage,
                });
                break;
            }
        }
        errors[element.name] = elementErrors;
    }
    return { valid, errors };
};




