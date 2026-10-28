"use client";

import { useState } from "react";
import { Button, Field, FieldLabel, ModalShell, ModalHeader, ModalTitle, ModalBody, ModalFooter, TextInput } from "./ui";

interface PromptModalProps {
    title: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

export default function PromptModal({ title, placeholder = "", defaultValue = "", onConfirm, onCancel }: PromptModalProps) {
    const [value, setValue] = useState(defaultValue);
    return (
        <ModalShell onClose={onCancel} width="480px">
            <form onSubmit={event => { event.preventDefault(); if (value.trim()) onConfirm(value.trim()); }}>
                <ModalHeader><ModalTitle>{title}</ModalTitle></ModalHeader>
                <ModalBody>
                    <Field>
                        <FieldLabel>{title}</FieldLabel>
                        <TextInput value={value} onChange={event => setValue(event.target.value)} placeholder={placeholder} autoFocus required />
                    </Field>
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variant="secondary" onClick={onCancel}>Zrušit</Button>
                    <Button type="submit" disabled={!value.trim()}>Potvrdit</Button>
                </ModalFooter>
            </form>
        </ModalShell>
    );
}
