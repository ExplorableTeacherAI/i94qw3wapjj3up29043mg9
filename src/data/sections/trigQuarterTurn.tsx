/**
 * Section 3 — Past the Quarter Turn (prediction first)
 * ====================================================
 * Confronts the misconception that trig ratios only work below 90°. The
 * student commits to a prediction for cos 140° on a number line that is
 * aligned with the circle's own horizontal scale, then the truth appears.
 */

import React, { useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    Button,
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineFeedback,
    InlineLinkedHighlight,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring, type Vec2 } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";
import { COS_COLOR, EASE_150, Halo, INK, INK_QUIET, INK_STRUCTURE, SIN_COLOR, formatAngle, formatUnit, svgPointFromEvent, toRadians } from "./trigShared";
import { FigureValueInputs, angleFromCosine, angleFromSine, roundTenth, wrapDegrees } from "./trigValueInputs";

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 370;
const CENTER_X = 150;
const CENTER_Y = 150;
const RADIUS = 96;
const LINE_Y = 312;
const DEFAULT_ANGLE = 140;

function QuarterTurnDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("turnAngle", DEFAULT_ANGLE);
    const guess = useVar<number>("turnGuess", 0);
    const revealed = useVar<boolean>("turnRevealed", false);
    const highlight = useVar<string>("turnHighlight", "");

    const [draggingGuess, setDraggingGuess] = useState(false);
    const [draggingArm, setDraggingArm] = useState(false);
    const [hoveredGuess, setHoveredGuess] = useState(false);
    const [hoveredArm, setHoveredArm] = useState(false);
    const guessRef = useRef(false);
    const armRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const guessScale = useSpring(draggingGuess || hoveredGuess ? 1.15 : 1, { stiffness: 400, damping: 26 });
    const armScale = useSpring(draggingArm || hoveredArm ? 1.15 : 1, { stiffness: 400, damping: 26 });

    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const weight = (id: string, resting: number) => (highlight === id ? resting * 1.6 : resting);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("turnHighlight", id),
        onPointerLeave: () => setVar("turnHighlight", ""),
    });

    const radians = toRadians(angle);
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const tipX = CENTER_X + cosine * RADIUS;
    const tipY = CENTER_Y - sine * RADIUS;
    const guessX = CENTER_X + guess * RADIUS;

    const moveGuess = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!guessRef.current) return;
        const point: Vec2 = svgPointFromEvent(event, svgRef.current, VIEW_WIDTH, VIEW_HEIGHT);
        const raw = (point.x - CENTER_X) / RADIUS;
        setVar("turnGuess", Math.round(clamp(raw, -1, 1) * 20) / 20);
    };

    const moveArm = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!armRef.current) return;
        const point: Vec2 = svgPointFromEvent(event, svgRef.current, VIEW_WIDTH, VIEW_HEIGHT);
        const degrees = (Math.atan2(CENTER_Y - point.y, point.x - CENTER_X) * 180) / Math.PI;
        setVar("turnAngle", roundTenth(wrapDegrees(degrees)));
    };

    const arcRadius = 32;
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
            aria-label="A crane arm swung past ninety degrees, with a number line below for predicting the cosine"
        >
            <defs>
                <filter id="turn-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Readouts beside the drawing. */}
            <g fontSize="12" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                <text x={VIEW_WIDTH - 24} y="56" fill={INK}>{`angle = ${formatAngle(angle)}`}</text>
                <text x={VIEW_WIDTH - 24} y="84" fill={COS_COLOR} opacity={dim("guess")}>
                    {`your guess = ${formatUnit(guess)}`}
                </text>
                {revealed && (
                    <>
                        <text x={VIEW_WIDTH - 24} y="112" fill={COS_COLOR} opacity={dim("run")}>
                            {`across = cos = ${formatUnit(cosine)}`}
                        </text>
                        <text x={VIEW_WIDTH - 24} y="140" fill={SIN_COLOR}>
                            {`up = sin = ${formatUnit(sine)}`}
                        </text>
                    </>
                )}
            </g>

            {/* Structure: axes, circle, arm, swept angle. */}
            <g opacity={dim("__structure")} style={EASE_150}>
                <line x1={CENTER_X - RADIUS - 16} y1={CENTER_Y} x2={CENTER_X + RADIUS + 16} y2={CENTER_Y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={CENTER_X} y1={CENTER_Y - RADIUS - 16} x2={CENTER_X} y2={CENTER_Y + RADIUS + 16} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="none" stroke={INK_STRUCTURE} strokeWidth="1.5" />
                <line x1={CENTER_X} y1={CENTER_Y} x2={tipX} y2={tipY} stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                <path d={arcPath} fill="none" stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                <text x={CENTER_X + Math.cos(labelRadians) * 48} y={CENTER_Y - Math.sin(labelRadians) * 48 + 4} fill={INK} fontSize="12" textAnchor="middle">
                    &#952;
                </text>
            </g>

            {/* The number line shares the circle's horizontal scale, so a value
                here sits directly below the same value on the circle. */}
            <g opacity={dim("__structure")} style={EASE_150}>
                <line x1={CENTER_X - RADIUS} y1={LINE_Y} x2={CENTER_X + RADIUS} y2={LINE_Y} stroke={INK_STRUCTURE} strokeWidth="1.5" strokeLinecap="round" />
                {[-1, -0.5, 0, 0.5, 1].map((value) => (
                    <line
                        key={value}
                        x1={CENTER_X + value * RADIUS}
                        y1={LINE_Y - 6}
                        x2={CENTER_X + value * RADIUS}
                        y2={LINE_Y + 6}
                        stroke={INK_QUIET}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                ))}
                <g fill={INK} fontSize="11" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <text x={CENTER_X - RADIUS} y={LINE_Y + 24}>&#8722;1</text>
                    <text x={CENTER_X} y={LINE_Y + 24}>0</text>
                    <text x={CENTER_X + RADIUS} y={LINE_Y + 24}>1</text>
                </g>
            </g>

            {/* After the reveal: the across leg, the climb, and the true value
                dropped straight down onto the same number line. */}
            {revealed && (
                <>
                    <g {...hoverProps("run")} opacity={dim("run")} style={EASE_150}>
                        <Halo active={highlight === "run"}>
                            <line x1={CENTER_X} y1={CENTER_Y} x2={tipX} y2={CENTER_Y} stroke={COS_COLOR} strokeWidth={weight("run", 3) + 6} strokeLinecap="round" />
                        </Halo>
                        <line x1={CENTER_X} y1={CENTER_Y} x2={tipX} y2={CENTER_Y} stroke={COS_COLOR} strokeWidth={weight("run", 3)} strokeLinecap="round" />
                        <line x1={tipX} y1={CENTER_Y} x2={tipX} y2={LINE_Y} stroke={COS_COLOR} strokeWidth="1.5" strokeDasharray="3 4" opacity={0.5} />
                        <circle cx={tipX} cy={LINE_Y} r="6" fill={COS_COLOR} />
                    </g>
                    <g opacity={dim("__rise")} style={EASE_150}>
                        <line x1={tipX} y1={CENTER_Y} x2={tipX} y2={tipY} stroke={SIN_COLOR} strokeWidth="3" strokeLinecap="round" />
                    </g>
                </>
            )}

            {/* The prediction marker: a solid knob before the reveal, a hollow
                ring afterwards so the guess stays visible next to the truth. */}
            <g {...hoverProps("guess")} opacity={dim("guess")} style={EASE_150}>
                {!revealed && (
                    <text x={guessX} y={LINE_Y - 22} fill={COS_COLOR} fontSize="11" textAnchor="middle">
                        your guess
                    </text>
                )}
                <Halo active={highlight === "guess"}>
                    <circle cx={guessX} cy={LINE_Y} r="14" fill={COS_COLOR} />
                </Halo>
                <g transform={`translate(${guessX} ${LINE_Y}) scale(${guessScale})`}>
                    {revealed ? (
                        <circle r="9" fill="#FFFFFF" stroke={COS_COLOR} strokeWidth="2.5" />
                    ) : (
                        <>
                            <circle r="9" fill={COS_COLOR} filter="url(#turn-handle-shadow)" />
                            <circle r="3.5" fill="#FFFFFF" />
                        </>
                    )}
                </g>
                {!revealed && (
                    <circle
                        cx={guessX}
                        cy={LINE_Y}
                        r="24"
                        fill="transparent"
                        style={{ cursor: draggingGuess ? "grabbing" : "grab", touchAction: "none" }}
                        onPointerDown={(event) => {
                            event.currentTarget.setPointerCapture(event.pointerId);
                            guessRef.current = true;
                            setDraggingGuess(true);
                        }}
                        onPointerMove={moveGuess}
                        onPointerUp={() => {
                            guessRef.current = false;
                            setDraggingGuess(false);
                        }}
                        onPointerCancel={() => {
                            guessRef.current = false;
                            setDraggingGuess(false);
                        }}
                        onPointerEnter={() => setHoveredGuess(true)}
                        onPointerLeave={() => setHoveredGuess(false)}
                    />
                )}
            </g>

            {/* The arm tip only becomes grabbable once the prediction is in. */}
            {revealed ? (
                <>
                    <g transform={`translate(${tipX} ${tipY}) scale(${armScale})`}>
                        <circle r="9" fill={INK} filter="url(#turn-handle-shadow)" />
                        <circle r="3.5" fill="#FFFFFF" />
                    </g>
                    <circle
                        cx={tipX}
                        cy={tipY}
                        r="24"
                        fill="transparent"
                        style={{ cursor: draggingArm ? "grabbing" : "grab", touchAction: "none" }}
                        onPointerDown={(event) => {
                            event.currentTarget.setPointerCapture(event.pointerId);
                            armRef.current = true;
                            setDraggingArm(true);
                        }}
                        onPointerMove={moveArm}
                        onPointerUp={() => {
                            armRef.current = false;
                            setDraggingArm(false);
                        }}
                        onPointerCancel={() => {
                            armRef.current = false;
                            setDraggingArm(false);
                        }}
                        onPointerEnter={() => setHoveredArm(true)}
                        onPointerLeave={() => setHoveredArm(false)}
                    />
                </>
            ) : (
                <circle cx={tipX} cy={tipY} r="5" fill={INK_STRUCTURE} />
            )}
        </svg>
    );
}

function QuarterTurnGuessInput() {
    const setVar = useSetVar();
    const guess = useVar<number>("turnGuess", 0);
    return (
        <FigureValueInputs
            fields={[
                {
                    id: "turn-guess",
                    label: "my prediction for cos 140°",
                    color: COS_COLOR,
                    display: formatUnit(guess),
                    onCommit: (value) =>
                        setVar("turnGuess", Math.round(clamp(value, -1, 1) * 20) / 20),
                },
            ]}
        />
    );
}

function QuarterTurnValueInputs() {
    const setVar = useSetVar();
    const angle = useVar<number>("turnAngle", DEFAULT_ANGLE);
    const radians = toRadians(angle);

    return (
        <FigureValueInputs
            fields={[
                {
                    id: "turn-angle",
                    label: "angle",
                    color: INK,
                    display: formatAngle(angle),
                    onCommit: (value) => setVar("turnAngle", wrapDegrees(roundTenth(value))),
                },
                {
                    id: "turn-cos",
                    label: "cos",
                    color: COS_COLOR,
                    display: formatUnit(Math.cos(radians)),
                    onCommit: (value) => setVar("turnAngle", angleFromCosine(value, angle)),
                },
                {
                    id: "turn-sin",
                    label: "sin",
                    color: SIN_COLOR,
                    display: formatUnit(Math.sin(radians)),
                    onCommit: (value) => setVar("turnAngle", angleFromSine(value, angle)),
                },
            ]}
        />
    );
}

function QuarterTurnFigure() {
    const setVar = useSetVar();
    const revealed = useVar<boolean>("turnRevealed", false);
    const angle = useVar<number>("turnAngle", DEFAULT_ANGLE);
    const hintStep = !revealed ? 0 : Math.abs(angle - DEFAULT_ANGLE) > 0.5 ? 2 : 1;

    return (
        <Figure
            id="quarter-turn-prediction"
            onReset={() => {
                setVar("turnAngle", DEFAULT_ANGLE);
                setVar("turnGuess", 0);
                setVar("turnRevealed", false);
                setVar("turnHighlight", "");
            }}
            caption={
                revealed
                    ? "The teal dot is the true cosine, dropped straight down from the arm. The hollow ring is where you predicted. Drag the arm tip anywhere now, or type an exact value."
                    : "Drag the teal marker along the number line, drag the bar, or type your exact prediction for cos 140°, then lock it in."
            }
        >
            <QuarterTurnDrawing />
            {revealed ? <QuarterTurnValueInputs /> : <QuarterTurnGuessInput />}
            <div className="px-6 pb-5">
                {revealed ? (
                    <FigureSlider
                        varName="turnAngle"
                        label="Arm angle"
                        {...numberPropsFromDefinition(getVariableInfo("turnAngle"))}
                        formatValue={formatAngle}
                    />
                ) : (
                    <div className="flex flex-col gap-4">
                        <FigureSlider
                            varName="turnGuess"
                            label="My prediction"
                            {...numberPropsFromDefinition(getVariableInfo("turnGuess"))}
                            formatValue={formatUnit}
                        />
                        <Button variant="outline" size="sm" className="self-start" onClick={() => setVar("turnRevealed", true)}>
                            Lock in my prediction
                        </Button>
                    </div>
                )}
            </div>
            <InteractionHintSequence
                hintKey="quarter-turn-predict"
                currentStep={hintStep}
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the marker to your prediction",
                        position: { x: "31%", y: "84%" },
                        dragPath: { type: "line", startOffset: { x: -30, y: 0 }, endOffset: { x: 30, y: 0 } },
                    },
                    {
                        gesture: "drag-circular",
                        label: "Now drag the arm tip all the way round",
                        position: { x: "16%", y: "24%" },
                        dragPath: { type: "arc", startAngle: -140, endAngle: -220, radius: 38 },
                    },
                ]}
            />
        </Figure>
    );
}

export const trigQuarterTurnBlocks: ReactElement[] = [
    <StackLayout key="layout-quarter-turn-heading" maxWidth="xl">
        <Block id="quarter-turn-heading" padding="md">
            <EditableH2 id="h2-quarter-turn-heading" blockId="quarter-turn-heading">
                Past the Quarter Turn
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quarter-turn-setup" maxWidth="xl">
        <Block id="quarter-turn-setup" padding="sm">
            <EditableParagraph id="para-quarter-turn-setup" blockId="quarter-turn-setup">
                • Swing the arm past the quarter turn and the tip ends up behind the
                base.
                <br />• Before anyone shows you the answer, drag the{" "}
                <InlineLinkedHighlight
                    varName="turnHighlight"
                    highlightId="guess"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("turnHighlight"))}
                >
                    teal marker
                </InlineLinkedHighlight>{" "}
                to where you think cos 140° lands.
                <br />• Lock in your prediction, then look.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quarter-turn-figure" maxWidth="xl">
        <Block id="quarter-turn-figure" padding="sm" hasVisualization>
            <QuarterTurnFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quarter-turn-insight" maxWidth="xl">
        <Block id="quarter-turn-insight" padding="sm">
            <EditableParagraph id="para-quarter-turn-insight" blockId="quarter-turn-insight">
                • Past 90° the tip reaches to the left of the base, so the{" "}
                <InlineLinkedHighlight
                    varName="turnHighlight"
                    highlightId="run"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("turnHighlight"))}
                >
                    across value
                </InlineLinkedHighlight>{" "}
                drops below zero.
                <br />• Cosine did not stop working at 90°, it simply changed sign.
                <br />• Keep swinging and watch which quarter of the circle flips which
                measurement.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quarter-turn-question-cosine" maxWidth="xl">
        <Block id="quarter-turn-question-cosine" padding="sm">
            <EditableParagraph id="para-quarter-turn-question-cosine" blockId="quarter-turn-question-cosine">
                At 200° the tip sits down and to the left of the base, so its cosine
                must be{" "}
                <InlineFeedback
                    varName="answerTurnCosSign"
                    correctValue="negative"
                    position="terminal"
                    successMessage="&#8212; yes, anything left of the base has an across value below zero"
                    failureMessage="&#8212; check which side of the base the tip is on"
                    hint="Left of the base means the across value is below zero"
                    visualizationHint={{
                        blockId: "quarter-turn-figure",
                        hintKey: "quarter-turn-feedback-hint",
                        label: "Discover it yourself",
                        resetVars: { turnAngle: 140, turnRevealed: true },
                        steps: [
                            {
                                gesture: "drag-circular",
                                label: "Drag the arm tip down to 200° and read the two values",
                                position: { x: "16%", y: "24%" },
                                dragPath: { type: "arc", startAngle: -140, endAngle: -200, radius: 38 },
                                completionVar: "turnAngle",
                                completionValue: 200,
                                completionTolerance: 12,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answerTurnCosSign"
                        correctAnswer="negative"
                        options={["positive", "negative", "zero"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerTurnCosSign"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-quarter-turn-question-sine" maxWidth="xl">
        <Block id="quarter-turn-question-sine" padding="sm">
            <EditableParagraph id="para-quarter-turn-question-sine" blockId="quarter-turn-question-sine">
                At that same 200°, the tip also hangs below the base, which makes its
                sine{" "}
                <InlineFeedback
                    varName="answerTurnSinSign"
                    correctValue="negative"
                    position="terminal"
                    successMessage="&#8212; right, a climb below the base counts as a negative climb"
                    failureMessage="&#8212; look at whether the tip is above or below the base"
                    hint="Below the horizontal axis, the climb is measured downward"
                    reviewBlockId="quarter-turn-insight"
                    reviewLabel="Review what happens past 90°"
                >
                    <InlineClozeChoice
                        varName="answerTurnSinSign"
                        correctAnswer="negative"
                        options={["positive", "negative", "zero"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerTurnSinSign"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
