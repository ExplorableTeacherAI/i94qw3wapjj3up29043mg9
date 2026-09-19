/**
 * Section 1 — Trigonometry on the Unit Circle (opening, text only)
 * ================================================================
 * Gains attention with the Lego crane hook, states where the lesson is going,
 * and recalls the three prerequisites the class already has.
 */

import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph, InlineFormula, InlineSpotColor, InlineTooltip } from "@/components/atoms";
import { getVariableInfo, spotColorPropsFromDefinition } from "../variables";

export const trigOpeningBlocks: ReactElement[] = [
    <StackLayout key="layout-opening-title" maxWidth="xl">
        <Block id="opening-title" padding="md">
            <EditableH1 id="h1-opening-title" blockId="opening-title">
                Trigonometry on the Unit Circle
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-opening-hook" maxWidth="xl">
        <Block id="opening-hook" padding="sm">
            <EditableParagraph id="para-opening-hook" blockId="opening-hook">
                • Build a Lego Technic crane and swing its arm slowly around.
                <br />• The tip traces a perfect circle, and at every instant it is
                some distance across and some distance up.
                <br />• Those two distances already have names you know:{" "}
                <InlineSpotColor id="spot-opening-hook-cosine" varName="cosineTerm" {...spotColorPropsFromDefinition(getVariableInfo("cosineTerm"))}>
                    cosine
                </InlineSpotColor>{" "}
                and{" "}
                <InlineSpotColor id="spot-opening-hook-sine" varName="sineTerm" {...spotColorPropsFromDefinition(getVariableInfo("sineTerm"))}>
                    sine
                </InlineSpotColor>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-opening-promise" maxWidth="xl">
        <Block id="opening-promise" padding="sm">
            <EditableParagraph id="para-opening-promise" blockId="opening-promise">
                • Here the arm is exactly one unit long, with its base pinned at the
                origin.
                <br />• Two rules fall out of that one picture:{" "}
                <InlineFormula
                    latex="\clr{sine}{\sin^2\theta} + \clr{cosine}{\cos^2\theta} = 1"
                    colorMap={{ sine: "#8E90F5", cosine: "#62D0AD" }}
                />{" "}
                and{" "}
                <InlineFormula
                    latex="\clr{tangent}{\tan\theta} = \dfrac{\clr{sine}{\sin\theta}}{\clr{cosine}{\cos\theta}}"
                    colorMap={{ tangent: "#F8A0CD", sine: "#8E90F5", cosine: "#62D0AD" }}
                />
                .
                <br />• You already have the toolkit:{" "}
                <InlineTooltip
                    id="tooltip-opening-promise-sohcahtoa"
                    tooltip="Sine is Opposite over Hypotenuse, Cosine is Adjacent over Hypotenuse, Tangent is Opposite over Adjacent."
                >
                    SOH-CAH-TOA
                </InlineTooltip>
                , Pythagoras, and plotting points with negative coordinates.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
