export const TOUCHED = 'data-touched';
export const IGNORE = 'data-ignore';

const browser = typeof window !== 'undefined';

export type FormDataElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type CustomValidatorCallback = (
    targetElement: FormDataElement,
    data: Record<string, string>
) => string | null;

export type CustomValidator = {
    element: FormDataElement,
    callback: CustomValidatorCallback
};

export type SimpleForm = {
    values: Record<string, string>,
    touched: string[],
    valid: string[],
    errors: Record<string, {
        state: string;
        message: string
    }>,
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


// Validate

const validityState = new Map();

export const validity = (name: string) => {

    return {
        get value() {
            return validityState.get(name) as CustomValidator[];
        },
        add(value: CustomValidator) {
            const current = validityState.get(name) as CustomValidator[];
            if (!current) {
                validityState.set(name, [value]);
                return;
            }
            current.push(value);
        }
    };
};

// FORM Listeners

export const setNoValidate = (form: HTMLFormElement) => {
    form.setAttribute('novalidate', '');
};

const addSubmitListener = (form: HTMLFormElement) => {
    setNoValidate(form);
    form.onsubmit = (event: Event) => {
        event.preventDefault();
        setAllTouched(form);
        if (!form.reportValidity()) {
            return false;
        }
        removeAllTouched(form);
    };
};

const removeSubmitListener = (form: HTMLFormElement) => {
    form.onsubmit = null;
}

const removeInputListener = (form: HTMLFormElement) => {
    form.oninput = null;
};

export const addListeners = (
    form: HTMLFormElement,
    name: string, callback: (data: SimpleForm) => void
) => {
    if (!browser) {
        return;
    }
    addSubmitListener(form);

    const formValidity = validity(name);

    form.oninput = (event: Event) => {

        const targetElement = event.target as FormDataElement;

        if (isIgnoredElement(targetElement)) {
            return;
        }

        validateCustomValidators(formValidity.value, form);

        setElementTouched(targetElement);

        const formElements = getFormElements(form);
        callback(formElements);
    };

};

export const removeListeners = (form: HTMLFormElement) => {
    if (!browser) {
        return;
    }
    removeSubmitListener(form);
    removeInputListener(form);
}

// IGNORE

export const isIgnoredElement = (element: FormDataElement) => {
    return element.hasAttribute(IGNORE);
}

// TOUCHED

export const isTouchedElement = (element: FormDataElement) => {
    return element.hasAttribute(TOUCHED);
}

export const setAllTouched = (node: HTMLFormElement) => {
    const formDataElements = getFormDataElements(node);
    for (const element of formDataElements) {
        element.setAttribute(TOUCHED, '');
    }
};

export const setElementTouched = (element: FormDataElement) => {
    element.setAttribute(TOUCHED, '');
};

export const removeAllTouched = (node: HTMLFormElement) => {
    const formDataElements = getFormDataElements(node);
    for (const element of formDataElements) {
        element.removeAttribute(TOUCHED);
    }
};

// FORM DATA

export const getFormValues = (formDataElements: FormDataElement[]) => {
    const values: Record<string, string> = {};
    for (const element of formDataElements) {
        values[element.name] = element.value;
    }
    return values;
};

export const getFormElements = (node: HTMLFormElement) => {

    const formDataElements = getFormDataElements(node, true);
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

export const getFormDataElements = (
    node: HTMLFormElement,
    onlyTouched = false
): FormDataElement[] => {
    const dataElements: FormDataElement[] = [];
    for (const element of node.elements) {
        if (
            isFormDataElement(element)
            && !element.hasAttribute(IGNORE)
            && element.name
        ) {
            if (onlyTouched) {
                if (isTouchedElement(element)) {
                    dataElements.push(element);
                }
                continue;
            }
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

    type ErrorValidity = Record<string, { state: string; message: string }>;

    const valid: string[] = [];
    const errors: ErrorValidity = {};

    for (const element of formDataElements) {
        if (element.validity.valid) {
            valid.push(element.name);
            continue;
        }
        let elementErrors: { state: string; message: string } | null = null;

        for (const state of validityStates) {
            if (element.validity[state]) {
                elementErrors = {
                    state,
                    message: element.validationMessage,
                };
                break;
            }
        }
        if (elementErrors) {
            errors[element.name] = elementErrors;
        }        
    }
    return { valid, errors };
};

export const validateCustomValidators = (validators: CustomValidator[], node: HTMLFormElement) => {

    const formElements = getFormDataElements(node);
    const formValues = getFormValues(formElements);

    for (const validator of validators) {
        const { callback, element } = validator;
        element.setCustomValidity('');
        const invalid = callback(element, formValues);
        if (invalid && !element.validationMessage) {
            element.setCustomValidity(invalid);
        }
    }
};



