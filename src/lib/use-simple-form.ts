import { getContext, hasContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";
import {
    type FormDataElement,
    type SimpleForm,
    type CustomValidatorCallback,
    validity,
    addListeners,
    removeListeners
} from "./simple-form";


// TODO - figure out chips input - 3
// TODO - save intitial form state - 4

// TODO - add optional to non-required fields (opt.)
// TODO - snapshot save form

export const useSimpleForm = (name = 'form') => {

    const formValidity = validity(name);

    const { data } = getFormContext(name);

    return {

        simple: (_node: HTMLFormElement) => {

            addListeners(_node, name, (formData: SimpleForm) => {
                data.set(formData);
            });

            return {
                update: () => { },
                destory: () => {
                    removeListeners(_node);
                }
            }
        },
        data,
        customValidator: (
            element: FormDataElement,
            callback: CustomValidatorCallback
        ) => {
            formValidity.add({ element, callback });
        }
    }
};

const getFormContext = (name: string) => {

    type FormContext = {
        data: Writable<SimpleForm>;
    };

    if (hasContext(name)) {
        return getContext<FormContext>(name);
    }
    const context: FormContext = {
        data: writable()
    };
    setContext(name, context);

    return context;
};

