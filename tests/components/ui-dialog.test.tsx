import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import PromptModal from "../../src/components/PromptModal";
import { ModalShell, ModalTitle } from "../../src/components/ui/Modal";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
afterEach(cleanup);

describe("shared dialog", () => {
  it("names the dialog, handles Escape, locks scrolling and restores the trigger", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    document.body.style.overflow = "auto";
    const onClose = vi.fn();
    const view = render(<ModalShell onClose={onClose}><ModalTitle>Upravit člena</ModalTitle></ModalShell>);
    const dialog = screen.getByRole("dialog", { name: "Upravit člena" });
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
    view.unmount();
    expect(document.body.style.overflow).toBe("auto");
    expect(trigger).toHaveFocus();
    trigger.remove();
    document.body.style.overflow = "";
  });

  it("only dismisses backdrop clicks and prevents Escape while busy", () => {
    const onClose = vi.fn();
    const view = render(<ModalShell aria-label="Import" onClose={onClose}><button>Importovat</button></ModalShell>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledOnce();
    view.rerender(<ModalShell aria-label="Import"><button>Importovat</button></ModalShell>);
    const event = new Event("cancel", { cancelable: true });
    fireEvent(screen.getByRole("dialog"), event);
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
  });

  it("keeps prompt input labeled and submits trimmed nonempty values", () => {
    const confirm = vi.fn();
    render(<PromptModal title="Název" onConfirm={confirm} onCancel={() => {}} />);
    expect(screen.getByRole("button", { name: "Potvrdit" })).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "Název" }), { target: { value: "  Schůzka  " } });
    fireEvent.submit(screen.getByRole("button", { name: "Potvrdit" }).closest("form")!);
    expect(confirm).toHaveBeenCalledWith("Schůzka");
  });

  it("loops Tab in both directions without reaching background controls", () => {
    const rects = vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
    render(<ModalShell aria-label="Edit"><input aria-label="Name" /><button>Save</button></ModalShell>);
    const input = screen.getByRole("textbox");
    const save = screen.getByRole("button", { name: "Save" });
    save.focus();
    fireEvent.keyDown(save, { key: "Tab" });
    expect(input).toHaveFocus();
    fireEvent.keyDown(input, { key: "Tab", shiftKey: true });
    expect(save).toHaveFocus();
    rects.mockRestore();
  });
});
