import { useEffect, useRef } from "react"

const AnimatedBackground = () => {
	const blobRefs = useRef([])
	const initialPositions = [
		{ x: -4, y: 0 },
		{ x: -4, y: 0 },
		{ x: 20, y: -8 },
		{ x: 20, y: -8 },
	]

	useEffect(() => {
		let currentScroll = 0
		let requestId

		const handleScroll = () => {
			const newScroll = window.pageYOffset
			// eslint-disable-next-line no-unused-vars
			const scrollDelta = newScroll - currentScroll
			currentScroll = newScroll

			blobRefs.current.forEach((blob, index) => {
				const initialPos = initialPositions[index]

				// Calculating movement in both X and Y direction
				const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340 // Horizontal movement
				const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40 // Vertical movement

				const x = initialPos.x + xOffset
				const y = initialPos.y + yOffset

				// Apply transformation with smooth transition
				blob.style.transform = `translate(${x}px, ${y}px)`
				blob.style.transition = "transform 1.4s ease-out"
			})

			requestId = requestAnimationFrame(handleScroll)
		}

		window.addEventListener("scroll", handleScroll)
		return () => {
			window.removeEventListener("scroll", handleScroll)
			cancelAnimationFrame(requestId)
		}
	}, [])

	return (
		<div className="fixed inset-0 pointer-events-none">
			<div
				className="absolute inset-0"
				style={{
					background: 'radial-gradient(circle at top, rgba(var(--color-backdrop-glow-rgb), 0.12) 0%, transparent 68%)',
					opacity: 0.6,
				}}
			/>
			<div className="absolute inset-0">
				<div
					ref={(ref) => (blobRefs.current[0] = ref)}
					style={{ backgroundColor: 'var(--color-background-blob-one)', opacity: 0.06 }}
					className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[90px]" />
				<div
					ref={(ref) => (blobRefs.current[1] = ref)}
					style={{ backgroundColor: 'var(--color-background-blob-two)', opacity: 0.05 }}
					className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[90px] hidden sm:block" />
				<div
					ref={(ref) => (blobRefs.current[2] = ref)}
					style={{ backgroundColor: 'var(--color-background-blob-three)', opacity: 0.05 }}
					className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[90px]" />
				<div
					ref={(ref) => (blobRefs.current[3] = ref)}
					style={{ backgroundColor: 'var(--color-background-blob-four)', opacity: 0.04 }}
					className="absolute -bottom-10 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[90px] hidden sm:block" />
			</div>
			<div
				className="absolute inset-0 opacity-80 bg-[linear-gradient(to_right,var(--color-grid-line-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line-soft)_1px,transparent_1px)] bg-[size:28px_28px]"
			/>
			<div className="absolute inset-0 border-t-2 border-white/5" />
		</div>
	)
}

export default AnimatedBackground

