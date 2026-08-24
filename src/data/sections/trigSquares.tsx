/**
 * Section 4 — Why the Squares Add to One (linked pair)
 * ====================================================
 * View A: real squares built on the two legs of the unit triangle.
 * View B: those same two squares poured into one bar of length 1.
 * Both read `identityAngle` and `identityHighlight` from the store — that
 * shared state, plus the identical 88px-per-unit scale, is the whole link.
 */

import React, { useRef, useState, type ReactElement } from "react";
import { SplitLayout, StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring, type Vec2 } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";
import { COS_COLOR, EASE_150, Halo, INK, INK_QUIET, INK_STRUCTURE, SIN_COLOR, formatAngle, formatUnit, svgPointFromEvent, toRadians } from "./trigShared";
import { FigureValueInputs, roundTenth } from "./trigValueInputs";

// ── Shared view scale — the visible tie between the two figures ──────────────

const VIEW_WIDTH = 360;
const VIEW_HEIGHT = 320;
const UNIT = 88; // pixels per unit in BOTH figures
const MIN_ANGLE = 5;
const MAX_ANGLE = 85;
const DEFAULT_ANGLE = 32;

const useSharedHighlight = () => {
    const highlight = useVar<string>("identityHighlight", "");
    const setVar = useSetVar();
    return {
        dim: (id: string) => (highlight && highlight !== id ? 0.35 : 1),
        weight: (id: string, resting: number) => (highlight === id ? resting * 1.6 : resting),
        isActive: (id: string) => highlight === id,
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar("identityHighlight", id),
            onPointerLeave: () => setVar("identityHighlight", ""),
        }),
    };
};

function AreaReadouts({ cosine, sine }: { cosine: number; sine: number }) {
    const { dim } = useSharedHighlight();
    return (
        <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
            <text x="24" y="34" fill={COS_COLOR} opacity={dim("cosArea")}>
                {`cos² = ${formatUnit(cosine * cosine)}`}
            </text>
            <text x={VIEW_WIDTH - 24} y="34" fill={SIN_COLOR} textAnchor="end" opacity={dim("sinArea")}>
                {`sin² = ${formatUnit(sine * sine)}`}
            </text>
        </g>
    );
}

// ── VIEW A: the squares standing on the legs ─────────────────────────────────

const CENTER_X = 90;
const CENTER_Y = 196;

function SquaresDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("identityAngle", DEFAULT_ANGLE);
    const { dim, weight, isActive, hoverProps } = useSharedHighlight();

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, { stiffness: 400, damping: 26 });

    const radians = toRadians(angle);
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const runPx = cosine * UNIT;
    const risePx = sine * UNIT;
    const tipX = CENTER_X + runPx;
    const tipY = CENTER_Y - risePx;

    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingRef.current) return;
        const point: Vec2 = svgPointFromEvent(event, svgRef.current, VIEW_WIDTH, VIEW_HEIGHT);
        const degrees = (Math.atan2(CENTER_Y - point.y, point.x - CENTER_X) * 180) / Math.PI;
        setVar("identityAngle", roundTenth(clamp(degrees, MIN_ANGLE, MAX_ANGLE)));
    };

    const arcPath =
        `M ${CENTER_X + 30} ${CENTER_Y} A 30 30 0 0 0 ` +
        `${CENTER_X + Math.cos(radians) * 30} ${CENTER_Y - Math.sin(radians) * 30}`;

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full select-none"
            role="img"
            aria-label="A right triangle inside a quarter circle with a real square built on each of its two legs"
        >
            <defs>
                <filter id="squares-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            <AreaReadouts cosine={cosine} sine={sine} />

            <g opacity={dim("__structure")} style={EASE_150}>
                <line x1={CENTER_X - 20} y1={CENTER_Y} x2={CENTER_X + UNIT + 22} y2={CENTER_Y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={CENTER_X} y1={CENTER_Y + 20} x2={CENTER_X} y2={CENTER_Y - UNIT - 22} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <path
                    d={`M ${CENTER_X + UNIT} ${CENTER_Y} A ${UNIT} ${UNIT} 0 0 0 ${CENTER_X} ${CENTER_Y - UNIT}`}
                    fill="none"
                    stroke={INK_STRUCTURE}
                    strokeWidth="1.5"
                />
                <line x1={CENTER_X} y1={CENTER_Y} x2={tipX} y2={tipY} stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                <path d={arcPath} fill="none" stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                <text x={CENTER_X + 44} y={CENTER_Y - 12} fill={INK} fontSize="12">&#952;</text>
            </g>

            {/* The square standing on the horizontal leg: side cos, area cos². */}
            <g {...hoverProps("cosArea")} opacity={dim("cosArea")} style={EASE_150}>
                <Halo active={isActive("cosArea")}>
                    <rect x={CENTER_X} y={CENTER_Y} width={runPx} height={runPx} fill="none" stroke={COS_COLOR} strokeWidth={weight("cosArea", 2.5) + 6} strokeLinejoin="round" />
                </Halo>
                <rect
                    x={CENTER_X}
                    y={CENTER_Y}
                    width={runPx}
                    height={runPx}
                    fill={COS_COLOR}
                    fillOpacity={isActive("cosArea") ? 0.35 : 0.15}
                    stroke={COS_COLOR}
                    strokeWidth={weight("cosArea", 2.5)}
                    strokeLinejoin="round"
                    style={{ transition: "fill-opacity 150ms ease" }}
                />
                <line x1={CENTER_X} y1={CENTER_Y} x2={tipX} y2={CENTER_Y} stroke={COS_COLOR} strokeWidth={weight("cosArea", 3)} strokeLinecap="round" />
            </g>

            {/* The square standing on the vertical leg: side sin, area sin². */}
            <g {...hoverProps("sinArea")} opacity={dim("sinArea")} style={EASE_150}>
                <Halo active={isActive("sinArea")}>
                    <rect x={tipX} y={tipY} width={risePx} height={risePx} fill="none" stroke={SIN_COLOR} strokeWidth={weight("sinArea", 2.5) + 6} strokeLinejoin="round" />
                </Halo>
                <rect
                    x={tipX}
                    y={tipY}
                    width={risePx}
                    height={risePx}
                    fill={SIN_COLOR}
                    fillOpacity={isActive("sinArea") ? 0.35 : 0.15}
                    stroke={SIN_COLOR}
                    strokeWidth={weight("sinArea", 2.5)}
                    strokeLinejoin="round"
                    style={{ transition: "fill-opacity 150ms ease" }}
                />
                <line x1={tipX} y1={CENTER_Y} x2={tipX} y2={tipY} stroke={SIN_COLOR} strokeWidth={weight("sinArea", 3)} strokeLinecap="round" />
            </g>

            <g transform={`translate(${tipX} ${tipY}) scale(${handleScale})`}>
                <circle r="9" fill={INK} filter="url(#squares-handle-shadow)" />
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

// ── VIEW B: the same two squares poured into one bar of length 1 ─────────────

const BAR_X = 30;
const BAR_WIDTH = 264;
const BAR_Y = 206;
const BAR_HEIGHT = 38;
const SQUARE_BASE_Y = 160;

function AreaBarDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("identityAngle", DEFAULT_ANGLE);
    const { dim, weight, isActive, hoverProps } = useSharedHighlight();

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.12 : 1, { stiffness: 400, damping: 26 });

    const radians = toRadians(angle);
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const cosArea = cosine * cosine;
    const dividerX = BAR_X + cosArea * BAR_WIDTH;

    const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
        if (!draggingRef.current) return;
        const point: Vec2 = svgPointFromEvent(event, svgRef.current, VIEW_WIDTH, VIEW_HEIGHT);
        const fraction = clamp((point.x - BAR_X) / BAR_WIDTH, 0, 1);
        const degrees = (Math.acos(Math.sqrt(fraction)) * 180) / Math.PI;
        setVar("identityAngle", roundTenth(clamp(degrees, MIN_ANGLE, MAX_ANGLE)));
    };

    const cosSide = cosine * UNIT;
    const sinSide = sine * UNIT;

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full select-none"
            role="img"
            aria-label="The two square areas stacked end to end, always filling a bar of length one"
        >
            <defs>
                <filter id="bar-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            <AreaReadouts cosine={cosine} sine={sine} />

            {/* The very same squares, drawn at the very same pixels per unit. */}
            <g {...hoverProps("cosArea")} opacity={dim("cosArea")} style={EASE_150}>
                <rect
                    x={BAR_X}
                    y={SQUARE_BASE_Y - cosSide}
                    width={cosSide}
                    height={cosSide}
                    fill={COS_COLOR}
                    fillOpacity={isActive("cosArea") ? 0.35 : 0.15}
                    stroke={COS_COLOR}
                    strokeWidth={weight("cosArea", 2.5)}
                    strokeLinejoin="round"
                    style={{ transition: "fill-opacity 150ms ease" }}
                />
            </g>
            <g {...hoverProps("sinArea")} opacity={dim("sinArea")} style={EASE_150}>
                <rect
                    x={BAR_X + cosSide + 12}
                    y={SQUARE_BASE_Y - sinSide}
                    width={sinSide}
                    height={sinSide}
                    fill={SIN_COLOR}
                    fillOpacity={isActive("sinArea") ? 0.35 : 0.15}
                    stroke={SIN_COLOR}
                    strokeWidth={weight("sinArea", 2.5)}
                    strokeLinejoin="round"
                    style={{ transition: "fill-opacity 150ms ease" }}
                />
            </g>

            {/* Their areas, laid end to end along a bar that is exactly 1 long. */}
            <g {...hoverProps("cosArea")} opacity={dim("cosArea")} style={EASE_150}>
                <rect x={BAR_X} y={BAR_Y} width={Math.max(dividerX - BAR_X, 0.5)} height={BAR_HEIGHT} fill={COS_COLOR} fillOpacity={isActive("cosArea") ? 0.55 : 0.35} stroke={COS_COLOR} strokeWidth={weight("cosArea", 2)} strokeLinejoin="round" style={{ transition: "fill-opacity 150ms ease" }} />
            </g>
            <g {...hoverProps("sinArea")} opacity={dim("sinArea")} style={EASE_150}>
                <rect x={dividerX} y={BAR_Y} width={Math.max(BAR_X + BAR_WIDTH - dividerX, 0.5)} height={BAR_HEIGHT} fill={SIN_COLOR} fillOpacity={isActive("sinArea") ? 0.55 : 0.35} stroke={SIN_COLOR} strokeWidth={weight("sinArea", 2)} strokeLinejoin="round" style={{ transition: "fill-opacity 150ms ease" }} />
            </g>

            <g opacity={dim("__structure")} style={EASE_150}>
                <g fill={INK} fontSize="11" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <text x={BAR_X} y={BAR_Y + BAR_HEIGHT + 22}>0</text>
                    <text x={BAR_X + BAR_WIDTH} y={BAR_Y + BAR_HEIGHT + 22}>1</text>
                </g>
                <text x={BAR_X} y={BAR_Y + BAR_HEIGHT + 52} fill={INK} fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`${formatUnit(cosine * cosine)} + ${formatUnit(sine * sine)} = 1.00`}
                </text>
            </g>

            {/* The split is draggable too: set the areas, the angle follows. */}
            <g transform={`translate(${dividerX} ${BAR_Y + BAR_HEIGHT / 2}) scale(${handleScale})`}>
                <rect x="-5" y="-27" width="10" height="54" rx="5" fill={INK} filter="url(#bar-handle-shadow)" />
            </g>
            <rect
                x={dividerX - 24}
                y={BAR_Y - 12}
                width="48"
                height={BAR_HEIGHT + 24}
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    draggingRef.current = true;
                    setDragging(true);
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

/** Angle boxes for a first-quadrant figure: type the angle, the cosine or the sine. */
function QuadrantOneValueInputs({ varName, angle }: { varName: string; angle: number }) {
    const setVar = useSetVar();
    const radians = toRadians(angle);
    const setAngle = (degrees: number) =>
        setVar(varName, roundTenth(clamp(degrees, MIN_ANGLE, MAX_ANGLE)));

    return (
        <FigureValueInputs
            fields={[
                {
                    id: `${varName}-angle`,
                    label: "angle",
                    color: INK,
                    display: formatAngle(angle),
                    onCommit: (value) => setAngle(value),
                },
                {
                    id: `${varName}-cos`,
                    label: "cos",
                    color: COS_COLOR,
                    display: formatUnit(Math.cos(radians)),
                    onCommit: (value) => setAngle((Math.acos(clamp(value, 0, 1)) * 180) / Math.PI),
                },
                {
                    id: `${varName}-sin`,
                    label: "sin",
                    color: SIN_COLOR,
                    display: formatUnit(Math.sin(radians)),
                    onCommit: (value) => setAngle((Math.asin(clamp(value, 0, 1)) * 180) / Math.PI),
                },
            ]}
        />
    );
}

function IdentityValueInputs() {
    const angle = useVar<number>("identityAngle", DEFAULT_ANGLE);
    return <QuadrantOneValueInputs varName="identityAngle" angle={angle} />;
}

function SquaresFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="identity-squares"
            onReset={() => {
                setVar("identityAngle", DEFAULT_ANGLE);
                setVar("identityHighlight", "");
            }}
            caption="A real square on each leg. Drag the dark tip: one square grows exactly as fast as the other shrinks."
        >
            <SquaresDrawing />
            <InteractionHintSequence
                hintKey="identity-squares-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Drag the tip along the arc",
                        position: { x: "46%", y: "47%" },
                        dragPath: { type: "arc", startAngle: -32, endAngle: -75, radius: 34 },
                    },
                ]}
            />
        </Figure>
    );
}

function AreaBarFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="identity-area-bar"
            onReset={() => {
                setVar("identityAngle", DEFAULT_ANGLE);
                setVar("identityHighlight", "");
            }}
            caption="The same two areas laid end to end. They always fill the bar exactly. Drag the split, or type an exact angle, cosine or sine."
        >
            <AreaBarDrawing />
            <IdentityValueInputs />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="identityAngle"
                    label="Angle"
                    {...numberPropsFromDefinition(getVariableInfo("identityAngle"))}
                    formatValue={formatAngle}
                />
            </div>
            <InteractionHintSequence
                hintKey="identity-bar-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the split between the two areas",
                        position: { x: "61%", y: "70%" },
                        dragPath: { type: "line", startOffset: { x: -28, y: 0 }, endOffset: { x: 28, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const trigSquaresBlocks: ReactElement[] = [
    <StackLayout key="layout-identity-heading" maxWidth="xl">
        <Block id="identity-heading" padding="md">
            <EditableH2 id="h2-identity-heading" blockId="identity-heading">
                Why the Squares Add to One
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-identity-setup" maxWidth="xl">
        <Block id="identity-setup" padding="sm">
            <EditableParagraph id="para-identity-setup" blockId="identity-setup">
                Build a real square on each leg of the triangle. With the arm at{" "}
                <InlineScrubbleNumber
                    varName="identityAngle"
                    {...numberPropsFromDefinition(getVariableInfo("identityAngle"))}
                    formatValue={formatAngle}
                />
                , drag the dark tip and watch the{" "}
                <InlineLinkedHighlight
                    varName="identityHighlight"
                    highlightId="cosArea"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("identityHighlight"))}
                >
                    teal square
                </InlineLinkedHighlight>{" "}
                shrink exactly as fast as the{" "}
                <InlineLinkedHighlight
                    varName="identityHighlight"
                    highlightId="sinArea"
                    color="#8E90F5"
                    bgColor="rgba(142, 144, 245, 0.2)"
                >
                    indigo square
                </InlineLinkedHighlight>{" "}
                grows.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-identity-pair" ratio="1:1" gap="lg" align="start">
        <Block id="identity-squares-figure" padding="sm" hasVisualization>
            <SquaresFigure />
        </Block>
        <Block id="identity-bar-figure" padding="sm" hasVisualization>
            <AreaBarFigure />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-identity-formula" maxWidth="xl">
        <Block id="identity-formula" padding="lg">
            <FormulaBlock
                latex="\clr{cosine}{\cos^2\theta} + \clr{sine}{\sin^2\theta} = 1"
                colorMap={{ cosine: "#62D0AD", sine: "#8E90F5" }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-identity-insight" maxWidth="xl">
        <Block id="identity-insight" padding="sm">
            <EditableParagraph id="para-identity-insight" blockId="identity-insight">
                The two areas always total exactly 1, and that is simply Pythagoras:
                leg squared plus leg squared equals hypotenuse squared, and here the
                hypotenuse is 1. Notice that each square is a genuine square. Its side
                is the sine, so its area is sine times sine, and that is all sin²θ has
                ever meant.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-identity-question-meaning" maxWidth="xl">
        <Block id="identity-question-meaning" padding="sm">
            <EditableParagraph id="para-identity-question-meaning" blockId="identity-question-meaning">
                So in that identity, sin²θ is shorthand for{" "}
                <InlineFeedback
                    varName="answerSquareMeaning"
                    correctValue="(sin θ) × (sin θ)"
                    position="terminal"
                    successMessage="&#8212; yes, you square the sine, never the angle"
                    failureMessage="&#8212; careful, the little 2 sits on the sine, not on the angle"
                    hint="The side of the square is sin θ, and a square's area is side times side"
                    reviewBlockId="identity-squares-figure"
                    reviewLabel="Look at the indigo square again"
                >
                    <InlineClozeChoice
                        varName="answerSquareMeaning"
                        correctAnswer="(sin θ) × (sin θ)"
                        options={["(sin θ) × (sin θ)", "sin(θ × θ)", "2 × sin θ"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerSquareMeaning"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-identity-question-value" maxWidth="xl">
        <Block id="identity-question-value" padding="sm">
            <EditableParagraph id="para-identity-question-value" blockId="identity-question-value">
                A different angle has sin θ = 0.6. Without touching a calculator,
                cos²θ must be{" "}
                <InlineFeedback
                    varName="answerCosSquared"
                    correctValue={["0.64", ".64"]}
                    position="terminal"
                    successMessage="&#8212; exactly, 0.36 of the bar is taken, so 0.64 is left"
                    failureMessage="&#8212; not yet"
                    hint="Square the 0.6 first, then ask how much of the bar of length 1 is left over"
                    reviewBlockId="identity-bar-figure"
                    reviewLabel="Look at the bar of length 1"
                >
                    <InlineClozeInput
                        varName="answerCosSquared"
                        correctAnswer={["0.64", ".64"]}
                        {...clozePropsFromDefinition(getVariableInfo("answerCosSquared"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
