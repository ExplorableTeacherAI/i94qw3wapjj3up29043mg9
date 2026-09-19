/**
 * Section 6 — Wrapping Up (text only)
 * ===================================
 * Keeps the promise the opening made, names the ideas worth carrying away,
 * and points at where the same circle turns up next. No new ideas, no quiz.
 */

import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph, InlineFormula, InlineSpotColor, InlineTooltip } from "@/components/atoms";
import { getVariableInfo, spotColorPropsFromDefinition } from "../variables";

export const trigWrapUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapup-heading" maxWidth="xl">
        <Block id="wrapup-heading" padding="md">
            <EditableH2 id="h2-wrapup-heading" blockId="wrapup-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-recap" maxWidth="xl">
        <Block id="wrapup-recap" padding="sm">
            <EditableParagraph id="para-wrapup-recap" blockId="wrapup-recap">
                • The crane arm was never really about cranes.
                <br />• Pin an arm of length 1 at the origin and its tip sits at{" "}
                <InlineFormula
                    id="formula-wrapup-recap-tip-point"
                    latex="(\clr{cosine}{\cos\theta},\ \clr{sine}{\sin\theta})"
                    colorMap={{ cosine: "#62D0AD", sine: "#8E90F5" }}
                />{" "}
                for every angle you can swing to, whichever side of zero it lands on.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-ideas" maxWidth="xl">
        <Block id="wrapup-ideas" padding="sm">
            <EditableParagraph id="para-wrapup-ideas" blockId="wrapup-ideas">
                • Build a square on each leg and the two areas fill exactly one unit,
                which is Pythagoras wearing a trigonometric coat.
                <br />• Tilt that same arm and its steepness, rise over run, is the{" "}
                <InlineSpotColor id="spot-wrapup-ideas-tangent" varName="tangentTerm" {...spotColorPropsFromDefinition(getVariableInfo("tangentTerm"))}>
                    tangent
                </InlineSpotColor>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-next" maxWidth="xl">
        <Block id="wrapup-next" padding="sm">
            <EditableParagraph id="para-wrapup-next" blockId="wrapup-next">
                • Read those three facts straight off one circle and the table of
                special angles stops being something to memorise.
                <br />• You will meet this circle again when you prove identities and
                solve trigonometric equations, where knowing the sign in each{" "}
                <InlineTooltip
                    id="tooltip-wrapup-next-quadrant"
                    tooltip="One of the four quarters of the circle cut out by the two axes. Each has its own pattern of signs for cosine and sine."
                >
                    quadrant
                </InlineTooltip>{" "}
                does half the work for you.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
