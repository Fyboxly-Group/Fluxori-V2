import React, { useEffect, useRef } from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  useMantineTheme, 
  Stack, 
  Title, 
  Tooltip, 
  ActionIcon
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { BuyBoxProduct } from '@/types/buybox';
import gsap from 'gsap';

export interface MarketPositionVisualizationProps {
  /** Product data for market position visualization */
  product: BuyBoxProduct;
  /** Minimum price for the product */
  minPrice?: number;
  /** Maximum price for the product */
  maxPrice?: number;
  /** Custom style */
  className?: string;
  /** Width of the visualization */
  width?: number;
  /** Height of the visualization */
  height?: number;
}

/**
 * Visualizes market position showing your price in relation to competitors
 * with interactive animations for highlighting position changes
 */
export const MarketPositionVisualization: React.FC<MarketPositionVisualizationProps> = ({
  product,
  minPrice,
  maxPrice,
  className,
  width = 400,
  height = 180
}) => {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const svgRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  
  // Calculate price ranges if not provided
  const effectiveMinPrice = minPrice ?? Math.min(
    product.lowestPrice,
    product.price,
    ...product.competitors.map(c => c.price)
  ) * 0.9; // Add 10% padding below
  
  const effectiveMaxPrice = maxPrice ?? Math.max(
    product.highestPrice,
    product.price,
    ...product.competitors.map(c => c.price)
  ) * 1.1; // Add 10% padding above
  
  // Padding for the visualization
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  
  // Map price to y-coordinate
  const getPricePosition = (price: number) => {
    return innerWidth * (price - effectiveMinPrice) / (effectiveMaxPrice - effectiveMinPrice);
  };
  
  // Create the visualization with GSAP animations
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous animations
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    const svg = svgRef.current;
    const timeline = gsap.timeline();
    timelineRef.current = timeline;
    
    // Animate the axis line
    const axisLine = svg.querySelector('.axis-line');
    if (axisLine) {
      timeline.fromTo(
        axisLine,
        { scaleX: 0 },
        { 
          scaleX: 1, 
          duration: 0.8, 
          ease: 'power2.out',
          transformOrigin: 'left center'
        }
      );
    }
    
    // Animate price ticks
    const ticks = svg.querySelectorAll('.tick');
    if (ticks.length) {
      timeline.fromTo(
        ticks,
        { opacity: 0, x: -5 },
        { 
          opacity: 1, 
          x: 0, 
          stagger: 0.1, 
          duration: 0.4, 
          ease: 'power2.out' 
        },
        '-=0.4'
      );
    }
    
    // Animate the markers
    const markers = svg.querySelectorAll('.price-marker');
    if (markers.length) {
      timeline.fromTo(
        markers,
        { opacity: 0, scale: 0.5 },
        { 
          opacity: 1, 
          scale: 1, 
          stagger: 0.12, 
          duration: 0.5, 
          ease: 'back.out(1.7)' 
        },
        '-=0.2'
      );
      
      // Pulse animation for buy box winner
      const buyBoxMarker = svg.querySelector('.buy-box-marker');
      if (buyBoxMarker) {
        timeline.to(
          buyBoxMarker,
          {
            scale: 1.2,
            duration: 0.3,
            repeat: 1,
            yoyo: true,
            ease: 'power2.inOut'
          },
          '+=0.3'
        );
      }
    }
    
    // Animate labels
    const labels = svg.querySelectorAll('.price-label');
    if (labels.length) {
      timeline.fromTo(
        labels,
        { opacity: 0, y: 5 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.08, 
          duration: 0.4,
          ease: 'power2.out' 
        },
        '-=0.6'
      );
    }
    
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [product, effectiveMinPrice, effectiveMaxPrice, innerWidth, innerHeight]);
  
  // Generate tick marks for the price axis
  const generateTicks = () => {
    const range = effectiveMaxPrice - effectiveMinPrice;
    const stepSize = range / 4; // Show 5 ticks
    const ticks = [];
    
    for (let price = effectiveMinPrice; price <= effectiveMaxPrice; price += stepSize) {
      ticks.push(Math.round(price * 100) / 100); // Round to 2 decimal places
    }
    
    return ticks;
  };
  
  const ticks = generateTicks();
  
  // Get buy box winner info
  const buyBoxWinner = product.hasBuyBox 
    ? { price: product.price, isYou: true, name: 'You' }
    : product.competitors.find(c => c.hasBuyBox) 
      ? { 
          price: product.competitors.find(c => c.hasBuyBox)!.price, 
          isYou: false, 
          name: product.competitors.find(c => c.hasBuyBox)!.name 
        }
      : null;
  
  return (
    <Paper ref={containerRef} withBorder p="md" className={className} radius="md">
      <Stack spacing="xs">
        <Group position="apart">
          <Title order={4}>Market Position</Title>
          <Tooltip label="Shows your price position compared to competitors">
            <ActionIcon size="sm" variant="subtle" color="gray">
              <IconInfoCircle size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
        
        <Text size="sm" color="dimmed">
          Price range: ${effectiveMinPrice.toFixed(2)} - ${effectiveMaxPrice.toFixed(2)}
        </Text>
        
        <div style={{ position: 'relative', width, height }}>
          <svg 
            ref={svgRef} 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}
          >
            {/* Price axis line */}
            <line 
              className="axis-line"
              x1={padding.left} 
              y1={padding.top + innerHeight / 2} 
              x2={padding.left + innerWidth} 
              y2={padding.top + innerHeight / 2}
              stroke={theme.colors.gray[5]}
              strokeWidth={2}
            />
            
            {/* Price ticks */}
            {ticks.map((tick, i) => (
              <g 
                key={`tick-${i}`} 
                className="tick" 
                transform={`translate(${padding.left + getPricePosition(tick)}, ${padding.top + innerHeight / 2})`}
              >
                <line 
                  x1={0} 
                  y1={-5} 
                  x2={0} 
                  y2={5} 
                  stroke={theme.colors.gray[6]}
                  strokeWidth={1}
                />
                <text 
                  x={0} 
                  y={20} 
                  textAnchor="middle" 
                  fill={theme.colors.gray[7]}
                  fontSize={12}
                >
                  ${tick.toFixed(2)}
                </text>
              </g>
            ))}
            
            {/* Your price marker */}
            <g 
              className={`price-marker your-marker ${product.hasBuyBox ? 'buy-box-marker' : ''}`}
              transform={`translate(${padding.left + getPricePosition(product.price)}, ${padding.top + innerHeight / 2 - 25})`}
            >
              <circle 
                r={product.hasBuyBox ? 12 : 8} 
                fill={product.hasBuyBox ? theme.colors.green[6] : theme.colors.blue[6]}
              />
              <text 
                className="price-label"
                y={-15} 
                textAnchor="middle" 
                fill={theme.colors.dark[9]}
                fontSize={12}
                fontWeight={600}
              >
                You
              </text>
              <text 
                className="price-label"
                y={4} 
                textAnchor="middle" 
                fill="white"
                fontSize={10}
                fontWeight={600}
              >
                ${product.price.toFixed(2)}
              </text>
              {product.hasBuyBox && (
                <path 
                  d="M-4,2 L-1,5 L4,-2" 
                  stroke="white" 
                  strokeWidth={2} 
                  fill="none"
                />
              )}
            </g>
            
            {/* Competitor price markers */}
            {product.competitors.map((competitor, i) => (
              <g 
                key={`competitor-${i}`}
                className={`price-marker competitor-marker ${competitor.hasBuyBox ? 'buy-box-marker' : ''}`}
                transform={`translate(${padding.left + getPricePosition(competitor.price)}, ${padding.top + innerHeight / 2 + 25})`}
              >
                <circle 
                  r={competitor.hasBuyBox ? 12 : 8} 
                  fill={competitor.hasBuyBox ? theme.colors.green[6] : theme.colors.orange[6]}
                />
                <text 
                  className="price-label"
                  y={20} 
                  textAnchor="middle" 
                  fill={theme.colors.dark[9]}
                  fontSize={12}
                >
                  {competitor.name.length > 10 ? competitor.name.substring(0, 10) + '...' : competitor.name}
                </text>
                <text 
                  className="price-label"
                  y={4} 
                  textAnchor="middle" 
                  fill="white"
                  fontSize={10}
                  fontWeight={600}
                >
                  ${competitor.price.toFixed(2)}
                </text>
                {competitor.hasBuyBox && (
                  <path 
                    d="M-4,2 L-1,5 L4,-2" 
                    stroke="white" 
                    strokeWidth={2} 
                    fill="none"
                  />
                )}
              </g>
            ))}
            
            {/* Buy Box indicator */}
            {buyBoxWinner && (
              <g transform={`translate(${padding.left + 80}, ${padding.top})`}>
                <text 
                  className="price-label"
                  fontWeight={600}
                  fill={theme.colors.green[7]}
                  fontSize={14}
                >
                  Buy Box Winner: {buyBoxWinner.name} (${buyBoxWinner.price.toFixed(2)})
                </text>
              </g>
            )}
          </svg>
        </div>
      </Stack>
    </Paper>
  );
};

export default MarketPositionVisualization;