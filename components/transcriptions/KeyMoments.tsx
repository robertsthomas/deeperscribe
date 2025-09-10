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
				<h3 className="text-lg font-semibold">Key Moments</h3>
				<div className="space-y-2">
					{[...Array(3)].map((_, i) => (
						<div key={`loading-${i}`} className="p-3 border rounded-lg">
							<div className="h-4 bg-muted rounded animate-pulse mb-2" />
							<div className="h-3 bg-muted rounded animate-pulse w-2/3" />
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
			<h3 className="text-lg font-semibold">Key Moments</h3>

			{/* First 3 moments */}
			<div className="space-y-2">
				{visibleMoments.map((moment, idx) => (
					<Button
						key={`${moment.desc}-${idx}`}
						variant="outline"
						className="w-full text-left justify-start h-auto p-3 flex-col items-start whitespace-normal break-words"
						onClick={() => onMomentClick(moment.searchText)}
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
										className="w-full text-left justify-start h-auto p-3 flex-col items-start whitespace-normal break-words"
										onClick={() => onMomentClick(moment.searchText)}
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
