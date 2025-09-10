import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { MousePointer } from "lucide-react";
import { useTranscription } from '@/hooks/useTranscription'

interface KeyMomentsProps {
	patientId: string | null;
	onMomentClick: (searchText: string) => void;
}

export function KeyMoments({ patientId, onMomentClick }: KeyMomentsProps) {
	const { keyMoments: moments, isGeneratingKeyMoments: isGenerating } = useTranscription({ patientId: patientId || '' })

	if (!patientId) return null
	if (isGenerating) {
		return (
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="text-lg font-semibold">Key Moments</h3>
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
						<span>Generating...</span>
					</div>
				</div>
				<div className="space-y-2">
					{Array.from({ length: 3 }, (_, i) => (
						<div key={`loading-skeleton-${Date.now()}-${i}`} className="p-3 border rounded-lg bg-muted/30">
							<div className="flex items-start gap-2">
								<div className="w-3 h-3 bg-muted rounded-full animate-pulse mt-1 flex-shrink-0" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${85 + (i * 10)}%` }} />
									<div className="h-3 bg-muted rounded animate-pulse w-1/3" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (moments.length === 0) {
		return (
			<div className="space-y-3">
				<h3 className="text-lg font-semibold">Key Moments</h3>
				<p className="text-sm text-muted-foreground">
					Key moments will appear here after processing. They summarize important parts of the visit
					and let you click to highlight the matching text in the transcript.
				</p>
			</div>
		);
	}

	const visibleMoments = moments.slice(0, 3);
	const hiddenMoments = moments.slice(3);

	return (
		<div className="space-y-3 max-w-full">
			<div className="flex items-center gap-2">
				<h3 className="text-lg font-semibold">Key Moments</h3>
				{isGenerating && (
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
						<span>Updating...</span>
					</div>
				)}
			</div>

			{/* First 3 moments */}
			<div className="space-y-2">
				{visibleMoments.map((moment, idx) => (
					<Button
						key={`${moment.desc}-${idx}`}
						variant="outline"
						className={`w-full text-left justify-start h-auto p-3 flex-col items-start whitespace-normal break-words transition-opacity ${
							isGenerating ? 'opacity-75' : ''
						}`}
						onClick={() => onMomentClick(moment.searchText)}
						disabled={isGenerating}
					>
						<div className="flex items-start gap-2 w-full">
							<MousePointer className="w-3 h-3 mt-1 flex-shrink-0 text-muted-foreground" />
							<div className="text-left flex-1 min-w-0">
								<div className="text-sm font-medium text-foreground break-words">
									{moment.desc}
								</div>
								{moment.time && (
									<div className="text-xs text-muted-foreground mt-1">
										{moment.time}
									</div>
								)}
							</div>
						</div>
					</Button>
				))}
			</div>

			{/* Accordion for additional moments */}
			{hiddenMoments.length > 0 && (
				<Accordion className="pt-1">
					<AccordionItem>
						<AccordionTrigger className="text-sm">
							Show {hiddenMoments.length} more moments
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-2">
								{hiddenMoments.map((moment, idx) => (
									<Button
										key={`${moment.desc}-${idx + 3}`}
										variant="outline"
										className={`w-full text-left justify-start h-auto p-3 flex-col items-start whitespace-normal break-words transition-opacity ${
											isGenerating ? 'opacity-75' : ''
										}`}
										onClick={() => onMomentClick(moment.searchText)}
										disabled={isGenerating}
									>
										<div className="flex items-start gap-2 w-full">
											<MousePointer className="w-3 h-3 mt-1 flex-shrink-0 text-muted-foreground" />
											<div className="text-left flex-1 min-w-0">
												<div className="text-sm font-medium text-foreground break-words">
													{moment.desc}
												</div>
												{moment.time && (
													<div className="text-xs text-muted-foreground mt-1">
														{moment.time}
													</div>
												)}
											</div>
										</div>
									</Button>
								))}
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			)}
		</div>
	);
}
