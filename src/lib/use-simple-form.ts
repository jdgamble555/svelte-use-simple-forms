import { getContext, hasContext, setContext } from "svelte";
import { get, writable, type Writable } from "svelte/store";

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

// TODO - make customValidator an exported function
// TODO - only validate touched controls
// TODO - look into error being object not array
// TODO - initial form value?
// TODO - look into invalid state for red border on untouched

export const useSimpleForm = (name = 'form') => {

    const { node, data } = getFormContext(name);

    return {

        simple: (_node: HTMLFormElement) => {

            node.set(_node);

            const onNodeInput = (event: Event) => {

                const targetElement = event.target as FormDataElement;

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

                resetCustomValidity(_node);
            };

            _node.addEventListener('input', onNodeInput);

            return {
                destory: () => {
                    _node.removeEventListener('input', onNodeInput);
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

            element.addEventListener('input', onElementInput);

            return {
                update: () => { },
                destory: () => {
                    element.removeEventListener('input', onElementInput);
                }
            }
        }
    }
};

const getFormValues = (formDataElements: FormDataElement[]) => {
    const values: Record<string, string> = {};
    for (const element of formDataElements) {
        values[element.name] = element.value;
    }
    return values;
};

const getFormElements = (node: HTMLFormElement, name: string) => {

    const formDataElements = getFormDataElements(node);
    const values = getFormValues(formDataElements);
    const touched = getTouchedElementNames(formDataElements, name);
    const { errors, valid } = getFormElementsValidity(formDataElements);

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

const resetCustomValidity = (node: HTMLFormElement) => {
    const elements = getFormDataElements(node);
    elements.forEach((element) => {
        element.setCustomValidity('');
    });
}


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
            && !element.hasAttribute('data-simple-form-ignore')
            && element.name
        ) {
            dataElements.push(element);
        }
    }
    return dataElements;
}

const getTouchedElementNames = (formDataElements: FormDataElement[], name: string) => {
    const touched = [];
    for (const element of formDataElements) {
        if (element.hasAttribute(`data-touched-${name}`)) {
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




