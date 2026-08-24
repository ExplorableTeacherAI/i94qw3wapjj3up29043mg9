/**
 * Section 1 — Trigonometry on the Unit Circle (opening, text only)
 * ================================================================
 * Gains attention with the Lego crane hook, states where the lesson is going,
 * and recalls the three prerequisites the class already has.
 */

import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph, InlineFormula } from "@/components/atoms";

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
                Build a Lego Technic crane and swing its arm slowly around. The tip
                traces a perfect circle, and at every instant it is some distance
                across and some distance up. Those two distances already have names
                you know: cosine and sine.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-opening-promise" maxWidth="xl">
        <Block id="opening-promise" padding="sm">
            <EditableParagraph id="para-opening-promise" blockId="opening-promise">
                Here we make the arm exactly one unit long and pin its base at the
                origin. Out of that single picture fall two rules you will use for
                years:{" "}
                <InlineFormula latex="\sin^2\theta + \cos^2\theta = 1" colorMap={{}} /> and{" "}
                <InlineFormula latex="\tan\theta = \dfrac{\sin\theta}{\cos\theta}" colorMap={{}} />.
                Everything you need is already in your toolkit: sine, cosine and
                tangent in a right-angled triangle, Pythagoras, and plotting points
                with negative coordinates.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
