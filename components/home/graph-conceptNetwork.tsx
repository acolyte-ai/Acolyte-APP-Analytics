import { useState, useEffect, useRef } from "react";
import { CardElementHome } from "./UI/element-home-card";
import * as d3 from "d3";

export default function ConceptNetwork() {
    const [loading, setLoading] = useState<boolean>(false)

    const svgRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 500;

        // Clear previous content
        svg.selectAll("*").remove();

        // Sample data - replace with your actual data
        const nodes = [
            { id: 'heart-failure', label: 'Heart Failure', strength: 'weak', x: 400, y: 50 },
            { id: 'cardiac-cycle', label: 'Cardiac Cycle', strength: 'moderate', x: 200, y: 120 },
            { id: 'lung-anatomy', label: 'Lung Anatomy', strength: 'moderate', x: 600, y: 120 },
            { id: 'gas-exchange', label: 'Gas Exchange', strength: 'strong', x: 100, y: 200 },
            { id: 'blood-pressure', label: 'Blood Pressure', strength: 'strong', x: 700, y: 200 },
            { id: 'circulation', label: 'Circulation', strength: 'weak', x: 50, y: 300 },
            { id: 'respiration', label: 'Respiration', strength: 'strong', x: 150, y: 380 },
            { id: 'pharmacology', label: 'Pharmacology', strength: 'moderate', x: 400, y: 420 },
            { id: 'pathology', label: 'Pathology', strength: 'strong', x: 550, y: 380 },
            { id: 'diagnostics', label: 'Diagnostics', strength: 'weak', x: 650, y: 300 },
            { id: 'treatment', label: 'Treatment', strength: 'strong', x: 750, y: 380 }
        ];

        const links = [
            { source: 'heart-failure', target: 'cardiac-cycle' },
            { source: 'heart-failure', target: 'lung-anatomy' },
            { source: 'heart-failure', target: 'blood-pressure' },
            { source: 'heart-failure', target: 'pharmacology' },
            { source: 'cardiac-cycle', target: 'gas-exchange' },
            { source: 'cardiac-cycle', target: 'circulation' },
            { source: 'lung-anatomy', target: 'gas-exchange' },
            { source: 'lung-anatomy', target: 'respiration' },
            { source: 'gas-exchange', target: 'respiration' },
            { source: 'blood-pressure', target: 'circulation' },
            { source: 'blood-pressure', target: 'diagnostics' },
            { source: 'circulation', target: 'respiration' },
            { source: 'respiration', target: 'pharmacology' },
            { source: 'pharmacology', target: 'pathology' },
            { source: 'pathology', target: 'diagnostics' },
            { source: 'diagnostics', target: 'treatment' },
            { source: 'pathology', target: 'treatment' }
        ];

        // Color mapping
        const colorMap = {
            strong: '#10b981',   // Green
            moderate: '#f59e0b', // Orange
            weak: '#ef4444'      // Red
        };

        // Create force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(35));

        // Create links
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', '#4a5568')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.6);

        // Create node groups
        const nodeGroup = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .style('cursor', 'pointer');

        // Add circles to nodes
        const circles = nodeGroup.append('circle')
            .attr('r', 10)
            .attr('fill', d => colorMap[d.strength])
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2);

        // Add labels
        const labels = nodeGroup.append('text')
            .text(d => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', 50)
            .attr('font-size', '12px')
            .attr('font-weight', '500')
            .attr('fill', d => colorMap[d.strength]);

        // Add drag behavior
        const drag = d3.drag()
            .on('start', (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        nodeGroup.call(drag);

        // Add hover effects
        nodeGroup
            .on('mouseover', function (event, d) {
                d3.select(this).select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', 30)
                    .attr('stroke-width', 3);
            })
            .on('mouseout', function (event, d) {
                d3.select(this).select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', 25)
                    .attr('stroke-width', 2);
            });

        // Update positions on simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodeGroup
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // Cleanup
        return () => {
            simulation.stop();
        };
    }, []);

    return (
        <CardElementHome loading={loading} classes={"h-[500px] w-full place-items-center "} title="Interactive Concept Network">
            <div className="h-[470px] rounded-lg w-full  flex flex-col items-center justify-center">


                <svg
                    ref={svgRef}

                    className="w-[calc(100vw-200px)] h-[400px]"
                />

                <div className="mb-4">


                    {/* Legend */}
                    <div className="flex gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1 border border-gray-400 rounded-full">   <div className="w-4 h-4 rounded-full bg-[#10b981]"></div></div>

                            <span className="text-[#10b981] text-sm">Strong</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1 border border-gray-400 rounded-full">
                                <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
                            </div>
                            <span className="text-[#f59e0b] text-sm">Moderate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1 border border-gray-400 rounded-full">
                                <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                            </div>
                            <span className="text-[#ef4444] text-sm">Weak</span>
                        </div>
                    </div>
                </div>


            </div>
        </CardElementHome>
    )
}