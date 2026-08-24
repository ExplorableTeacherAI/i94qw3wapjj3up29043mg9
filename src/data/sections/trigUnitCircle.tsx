/**
 * Section 2 — One Arm, Two Measurements
 * =====================================
 * The core idea: with an arm of length 1, the tip of the crane sits at
 * (cos θ, sin θ). Bespoke figure, draggable tip, live run / rise readouts.
 */

import React, { useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    InteractionHintSequence,
    RevealOnInteraction,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { useRafLoop, useSpring, type Vec2 } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
    spotColorPropsFromDefinition,
} from "../variables";
import { COS_COLOR, EASE_150, Halo, INK, INK_QUIET, INK_STRUCTURE, SIN_COLOR, formatAngle, formatUnit, svgPointFromEvent, toRadians } from "./trigShared";

// ── View geometry (24px+ padding, nothing clipped at any angle) ──────────────

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 340;
const CENTER_X = 170;
const CENTER_Y = 178;
const RADIUS = 104;
const DEFAULT_ANGLE = 35;

function CraneDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("craneAngle", DEFAULT_ANGLE);
    const sweeping = useVar<boolean>("craneSweeping", false);
    const highlight = useVar<string>("craneHighlight", "");
    const explored = useVar<boolean>("craneExplored", false);

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, { stiffness: 400, damping: 26 });

    useRafLoop((_dt, elapsed) => setVar("craneAngle", Math.round((elapsed * 40) % 360)), {
        paused: !sweeping || dragging,
    });

    // Any real change to the angle counts as exploring, however it was made.
    React.useEffect(() => {
        if (!explored && Math.round(angle) !== DEFAULT_ANGLE) setVar("craneExplored", true);
    }, [angle, explored, setVar]);

    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const weight = (id: string, resting: number) => (highlight === id ? resting * 1.6 : resting);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("craneHighlight", id),
        onPointerLeave: () => setVar("craneHighlight", ""),
    });

    const radians = toRadians(angle);
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const tipX = CENTER_X + cosine * RADIUS;
    const tipY = CENTER_Y - sine * RADIUS;

    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingRef.current) return;
        const point: Vec2 = svgPointFromEvent(event, svgRef.current, VIEW_WIDTH, VIEW_HEIGHT);
        const degrees = (Math.atan2(CENTER_Y - point.y, point.x - CENTER_X) * 180) / Math.PI;
        setVar("craneAngle", Math.round((degrees + 360) % 360));
        setVar("craneExplored", true);
    };

    const arcRadius = 34;
    const largeArc = angle > 180 ? 1 : 0;
    const arcPath =
        `M ${CENTER_X + arcRadius} ${CENTER_Y} ` +
        `A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ` +
        `${CENTER_X + Math.cos(radians) * arcRadius} ${CENTER_Y - Math.sin(radians) * arcRadius}`;
    const labelRadians = toRadians(angle / 2);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full select-none"
            role="img"
            aria-label="A crane arm of length one on a circle; its horizontal run is cosine and its vertical rise is sine"
        >
            <defs>
                <filter id="crane-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Readouts sit beside the drawing, never over it. */}
            <g fontSize="12" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                <text x={VIEW_WIDTH - 24} y="56" fill={INK}>{`angle = ${formatAngle(angle)}`}</text>
                <text x={VIEW_WIDTH - 24} y="84" fill={COS_COLOR} opacity={dim("run")}>
                    {`across = cos = ${formatUnit(cosine)}`}
                </text>
                <text x={VIEW_WIDTH - 24} y="112" fill={SIN_COLOR} opacity={dim("rise")}>
                    {`up = sin = ${formatUnit(sine)}`}
                </text>
            </g>

            {/* Ambient structure: axes, unit circle, scale marks. */}
            <g opacity={dim("__structure")} style={EASE_150}>
                <line x1={CENTER_X - RADIUS - 18} y1={CENTER_Y} x2={CENTER_X + RADIUS + 18} y2={CENTER_Y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={CENTER_X} y1={CENTER_Y - RADIUS - 18} x2={CENTER_X} y2={CENTER_Y + RADIUS + 18} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="none" stroke={INK_STRUCTURE} strokeWidth="1.5" />
                <g fill={INK} fontSize="11" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <text x={CENTER_X + RADIUS} y={CENTER_Y + 18} textAnchor="middle">1</text>
                    <text x={CENTER_X - RADIUS} y={CENTER_Y + 18} textAnchor="middle">&#8722;1</text>
                    <text x={CENTER_X - 10} y={CENTER_Y - RADIUS + 4} textAnchor="end">1</text>
                    <text x={CENTER_X - 10} y={CENTER_Y + RADIUS + 4} textAnchor="end">&#8722;1</text>
                </g>
                {/* The arm itself: structure weight, plus the swept angle. */}
                <line x1={CENTER_X} y1={CENTER_Y} x2={tipX} y2={tipY} stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                <path d={arcPath} fill="none" stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                <text x={CENTER_X + Math.cos(labelRadians) * 50} y={CENTER_Y - Math.sin(labelRadians) * 50 + 4} fill={INK} fontSize="12" textAnchor="middle">
                    &#952;
                </text>
            </g>

            {/* RUN — the horizontal reach, cosine. */}
            <g {...hoverProps("run")} opacity={dim("run")} style={EASE_150}>
                <Halo active={highlight === "run"}>
                    <line x1={CENTER_X} y1={CENTER_Y} x2={tipX} y2={CENTER_Y} stroke={COS_COLOR} strokeWidth={weight("run", 3) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={CENTER_X} y1={CENTER_Y} x2={tipX} y2={CENTER_Y} stroke={COS_COLOR} strokeWidth={weight("run", 3)} strokeLinecap="round" />
                <line x1={tipX} y1={tipY} x2={tipX} y2={CENTER_Y} stroke={COS_COLOR} strokeWidth="1.5" strokeDasharray="3 4" opacity={0.5} />
            </g>

            {/* RISE — the vertical climb, sine. */}
            <g {...hoverProps("rise")} opacity={dim("rise")} style={EASE_150}>
                <Halo active={highlight === "rise"}>
                    <line x1={tipX} y1={CENTER_Y} x2={tipX} y2={tipY} stroke={SIN_COLOR} strokeWidth={weight("rise", 3) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={tipX} y1={CENTER_Y} x2={tipX} y2={tipY} stroke={SIN_COLOR} strokeWidth={weight("rise", 3)} strokeLinecap="round" />
                <line x1={tipX} y1={tipY} x2={CENTER_X} y2={tipY} stroke={SIN_COLOR} strokeWidth="1.5" strokeDasharray="3 4" opacity={0.5} />
            </g>

            {/* The draggable crane tip. */}
            <g transform={`translate(${tipX} ${tipY}) scale(${handleScale})`}>
                <circle r="9" fill={INK} filter="url(#crane-handle-shadow)" />
                <circle r="3.5" fill="#FFFFFF" />
            </g>
            <circle
                cx={tipX}
                cy={tipY}
                r="24"
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    draggingRef.current = true;
                    setDragging(true);
                    setVar("craneExplored", true);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerCancel={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />
        </svg>
    );
}

function CraneFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="unit-circle-crane"
            playable
            playVarName="craneSweeping"
            onReset={() => {
                setVar("craneAngle", DEFAULT_ANGLE);
                setVar("craneSweeping", false);
                setVar("craneHighlight", "");
            }}
            caption="Drag the dark tip around the circle. The teal bar is how far across the arm reaches, the indigo bar is how high it climbs."
        >
            <CraneDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="craneAngle"
                    label="Arm angle"
                    {...numberPropsFromDefinition(getVariableInfo("craneAngle"))}
                    formatValue={formatAngle}
                />
            </div>
            <InteractionHintSequence
                hintKey="unit-circle-crane-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Drag the crane tip around the circle",
                        position: { x: "53%", y: "35%" },
                        dragPath: { type: "arc", startAngle: -35, endAngle: -110, radius: 40 },
                    },
                ]}
            />
        </Figure>
    );
}

export const trigUnitCircleBlocks: ReactElement[] = [
    <StackLayout key="layout-unit-circle-heading" maxWidth="xl">
        <Block id="unit-circle-heading" padding="md">
            <EditableH2 id="h2-unit-circle-heading" blockId="unit-circle-heading">
                One Arm, Two Measurements
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-unit-circle-setup" maxWidth="xl">
        <Block id="unit-circle-setup" padding="sm">
            <EditableParagraph id="para-unit-circle-setup" blockId="unit-circle-setup">
                Pin the crane's base at the origin and make the arm exactly one unit
                long. Swing it to{" "}
                <InlineScrubbleNumber
                    varName="craneAngle"
                    {...numberPropsFromDefinition(getVariableInfo("craneAngle"))}
                    formatValue={formatAngle}
                />{" "}
                by dragging the dark tip, and the{" "}
                <InlineLinkedHighlight
                    varName="craneHighlight"
                    highlightId="run"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("craneHighlight"))}
                >
                    reach across
                </InlineLinkedHighlight>{" "}
                and the{" "}
                <InlineLinkedHighlight
                    varName="craneHighlight"
                    highlightId="rise"
                    color="#8E90F5"
                    bgColor="rgba(142, 144, 245, 0.2)"
                >
                    climb upward
                </InlineLinkedHighlight>{" "}
                trade off against each other, and neither ever passes 1.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-unit-circle-figure" maxWidth="xl">
        <Block id="unit-circle-figure" padding="sm" hasVisualization>
            <CraneFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-unit-circle-insight" maxWidth="xl">
        <Block id="unit-circle-insight" padding="sm">
            <EditableParagraph id="para-unit-circle-insight" blockId="unit-circle-insight">
                Because the arm is 1 long, SOH-CAH-TOA collapses into something
                lovely. The{" "}
                <InlineSpotColor varName="cosineTerm" {...spotColorPropsFromDefinition(getVariableInfo("cosineTerm"))}>
                    cosine
                </InlineSpotColor>{" "}
                is the reach divided by 1, and the{" "}
                <InlineSpotColor varName="sineTerm" {...spotColorPropsFromDefinition(getVariableInfo("sineTerm"))}>
                    sine
                </InlineSpotColor>{" "}
                is the climb divided by 1. So the tip is always parked at the point
                (cos, sin), and the circle becomes a lookup table for every angle.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-unit-circle-question-reading" maxWidth="xl">
        <Block id="unit-circle-question-reading" padding="sm">
            <EditableParagraph id="para-unit-circle-question-reading" blockId="unit-circle-question-reading">
                <RevealOnInteraction
                    varName="craneExplored"
                    placeholder="Swing the arm a little, then a question will appear here."
                >
                    Another crane parks its tip at the point (0.64, 0.77). For that
                    angle, the cosine is{" "}
                    <InlineFeedback
                        varName="answerCraneCosine"
                        correctValue={["0.64", ".64"]}
                        position="terminal"
                        successMessage="&#8212; yes, cosine is the across value, so it is the first coordinate"
                        failureMessage="&#8212; check which coordinate is the across one"
                        hint="The first number of a point is how far across it sits"
                        reviewBlockId="unit-circle-insight"
                        reviewLabel="Look again at the tip's coordinates"
                    >
                        <InlineClozeInput
                            varName="answerCraneCosine"
                            correctAnswer={["0.64", ".64"]}
                            {...clozePropsFromDefinition(getVariableInfo("answerCraneCosine"))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-unit-circle-question-limit" maxWidth="xl">
        <Block id="unit-circle-question-limit" padding="sm">
            <EditableParagraph id="para-unit-circle-question-limit" blockId="unit-circle-question-limit">
                <RevealOnInteraction varName="craneExplored">
                    Swing the arm anywhere you like and the climb never passes 1,
                    because{" "}
                    <InlineFeedback
                        varName="answerCraneLimit"
                        correctValue="the arm is only 1 unit long"
                        position="terminal"
                        successMessage="&#8212; exactly, the climb is part of the arm, so it can never beat the whole arm"
                        failureMessage="&#8212; not that one"
                        hint="The climb is one side of a triangle whose longest side is the arm"
                    >
                        <InlineClozeChoice
                            varName="answerCraneLimit"
                            correctAnswer="the arm is only 1 unit long"
                            options={["the arm is only 1 unit long", "the angle stays below 90 degrees", "sine is always positive"]}
                            {...choicePropsFromDefinition(getVariableInfo("answerCraneLimit"))}
                        />
                    </InlineFeedback>.
                </RevealOnInteraction>
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
