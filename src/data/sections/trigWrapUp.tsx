/**
 * Section 6 — Wrapping Up (text only)
 * ===================================
 * Keeps the promise the opening made, names the ideas worth carrying away,
 * and points at where the same circle turns up next. No new ideas, no quiz.
 */

import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";

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
                So the crane arm was never really about cranes. Pin an arm of length 1
                at the origin and its tip sits at (cos θ, sin θ) for every angle you
                can swing to, whichever side of zero it lands on.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-ideas" maxWidth="xl">
        <Block id="wrapup-ideas" padding="sm">
            <EditableParagraph id="para-wrapup-ideas" blockId="wrapup-ideas">
                Build a square on each leg and the two areas fill exactly one unit,
                which is Pythagoras wearing a trigonometric coat. Tilt that same arm
                and its steepness, rise over run, is the tangent.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-next" maxWidth="xl">
        <Block id="wrapup-next" padding="sm">
            <EditableParagraph id="para-wrapup-next" blockId="wrapup-next">
                Once you can read those three facts straight off one circle, the table
                of special angles stops being something to memorise. You will meet this
                circle again when you prove identities and solve trigonometric
                equations, where knowing the sign in each quadrant does half the work
                for you.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
