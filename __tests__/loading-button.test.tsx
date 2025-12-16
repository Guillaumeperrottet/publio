/**
 * Tests pour le composant LoadingButton
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingButton } from "@/components/ui/loading-button";
import userEvent from "@testing-library/user-event";

describe("LoadingButton", () => {
  it("devrait s'afficher avec le texte fourni", () => {
    render(<LoadingButton>Enregistrer</LoadingButton>);
    expect(screen.getByText("Enregistrer")).toBeInTheDocument();
  });

  it("devrait afficher un spinner quand loading=true", () => {
    render(<LoadingButton loading={true}>Enregistrer</LoadingButton>);

    // Le spinner Lucide a la classe animate-spin
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("devrait être désactivé quand loading=true", () => {
    render(<LoadingButton loading={true}>Enregistrer</LoadingButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("devrait être désactivé quand disabled=true", () => {
    render(<LoadingButton disabled={true}>Enregistrer</LoadingButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("devrait appeler onClick quand cliqué et pas loading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<LoadingButton onClick={handleClick}>Enregistrer</LoadingButton>);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("ne devrait pas appeler onClick quand loading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <LoadingButton loading={true} onClick={handleClick}>
        Enregistrer
      </LoadingButton>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("devrait afficher loadingText si fourni", () => {
    render(
      <LoadingButton loading={true} loadingText="Sauvegarde en cours...">
        Enregistrer
      </LoadingButton>
    );

    expect(screen.getByText("Sauvegarde en cours...")).toBeInTheDocument();
    expect(screen.queryByText("Enregistrer")).not.toBeInTheDocument();
  });

  it("devrait accepter les props de variant", () => {
    render(<LoadingButton variant="outline">Annuler</LoadingButton>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("devrait accepter les props de size", () => {
    render(<LoadingButton size="sm">Petit bouton</LoadingButton>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
