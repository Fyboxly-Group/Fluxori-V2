import { useEffect, useRef } from 'react';
import { Paper, Group, Text, Stack, Badge } from '@mantine/core';
import { gsap } from 'gsap';

export interface BuyBoxStatusCardProps {
  hasWon: boolean;
  previousOwner?: string;
  currentOwner: string;
  yourPrice: number;
  competitorPrice?: number;
  previousPrice?: number;
  className?: string;
}

export const BuyBoxStatusCard: React.FC<BuyBoxStatusCardProps> = ({
  hasWon,
  previousOwner,
  currentOwner,
  yourPrice,
  competitorPrice,
  previousPrice,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const hasChanged = previousOwner && previousOwner !== currentOwner;
  const priceChanged = previousPrice !== undefined && previousPrice !== yourPrice;
  
  // Animate on owner change
  useEffect(() => {
    if (containerRef.current && statusRef.current && hasChanged) {
      const timeline = gsap.timeline();
      
      // Pulse animation for ownership change
      timeline
        .to(containerRef.current, {
          scale: 1.03,
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          duration: 0.3
        })
        .to(containerRef.current, {
          scale: 1,
          boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
          duration: 0.4,
          ease: 'power2.out'
        });
      
      // Status text animation
      gsap.fromTo(statusRef.current, 
        { 
          y: -20, 
          opacity: 0,
          color: hasWon ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)'
        },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.4,
          delay: 0.3
        }
      );
    }
  }, [hasWon, hasChanged, currentOwner]);
  
  // Animate on price change
  useEffect(() => {
    if (priceRef.current && priceChanged) {
      const isIncrease = previousPrice !== undefined && yourPrice > previousPrice;
      
      // Flash the background with appropriate color
      gsap.to(priceRef.current, {
        backgroundColor: isIncrease ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)',
        duration: 0.2,
        onComplete: () => {
          // Fade out the background
          gsap.to(priceRef.current, {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            duration: 1.5,
            delay: 0.2
          });
        }
      });
      
      // Animate the number if we have the previous value
      if (previousPrice !== undefined) {
        const priceDisplay = priceRef.current.querySelector('.price-value');
        if (priceDisplay) {
          const startValue = previousPrice;
          const endValue = yourPrice;
          let currentValue = startValue;
          
          gsap.to({value: startValue}, {
            value: endValue,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: function() {
              currentValue = this.targets()[0].value;
              if (priceDisplay) {
                priceDisplay.textContent = `$${currentValue.toFixed(2)}`;
              }
            }
          });
        }
      }
    }
  }, [yourPrice, previousPrice, priceChanged]);
  
  return (
    <Paper ref={containerRef} p="md" withBorder shadow="sm" className={className}>
      <Stack spacing="md">
        <Group position="apart">
          <Text weight={700} size="lg">Buy Box Status</Text>
          {hasWon ? (
            <Badge color="green">You Own It</Badge>
          ) : (
            <Badge color="red">Not Owned</Badge>
          )}
        </Group>
        
        <div ref={statusRef} style={{ textAlign: 'center', padding: '8px 0' }}>
          {hasWon ? (
            <Text color="green" weight={600} size="lg">You have the Buy Box!</Text>
          ) : (
            <Text color="red" weight={600} size="lg">Competitor has the Buy Box</Text>
          )}
        </div>
        
        <Stack spacing="xs">
          <Group position="apart">
            <Text size="sm">Buy Box Owner:</Text>
            <Text weight={500}>{currentOwner}</Text>
          </Group>
          
          <Group position="apart" ref={priceRef} style={{ padding: '4px 8px', borderRadius: '4px' }}>
            <Text size="sm">Your Price:</Text>
            <Text weight={600} className="price-value">${yourPrice.toFixed(2)}</Text>
          </Group>
          
          {competitorPrice && (
            <Group position="apart">
              <Text size="sm">Competitor Price:</Text>
              <Text weight={500}>${competitorPrice.toFixed(2)}</Text>
            </Group>
          )}
          
          {hasWon ? (
            <Group position="apart" mt={8}>
              <Text size="sm">Price Difference:</Text>
              {competitorPrice && (
                <Text weight={600} color={yourPrice < competitorPrice ? 'green' : 'red'}>
                  {yourPrice < competitorPrice ? '-' : '+'}${Math.abs(yourPrice - competitorPrice).toFixed(2)}
                </Text>
              )}
            </Group>
          ) : (
            competitorPrice && (
              <Group position="apart" mt={8}>
                <Text size="sm">To Win Buy Box:</Text>
                <Text weight={600} color="blue">
                  Lower price by ${(yourPrice - competitorPrice + 0.01).toFixed(2)}
                </Text>
              </Group>
            )
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default BuyBoxStatusCard;