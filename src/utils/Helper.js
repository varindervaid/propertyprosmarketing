export const formValidation = (formValues) => {
    if (!formValues.email && !formValues.password) return 'Email and Password are required';
    if (!formValues.email) return 'Email is required';
    if (!formValues.password) return 'Password is required';
    return true;
}

export const showToast = (toast, type, summary, message) => {
    return toast.add({
        severity: type, // success, info, warn, error
        summary: summary,
        detail: message,
        life: 3000, // Time in milliseconds
    });
}