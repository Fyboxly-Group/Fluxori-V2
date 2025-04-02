import { useEffect, useRef, useState } from 'react';
import { 
  Paper, Title, Group, Text, Badge, Card, Image, Stack, 
  ThemeIcon, Button, ScrollArea, ActionIcon, Box
} from '@mantine/core';
import { 
  IconArrowLeft, IconArrowRight, IconBrain, IconBulb,
  IconShoppingCart, IconEye, IconStar
} from '@tabler/icons-react';
import { gsap } from 'gsap';

export interface ProductRecommendation {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  confidence: number; // 0-1
  relationshipType: 'frequently_bought_together' | 'similar' | 'complementary' | 'trending';
  badges?: string[];
}

export interface AIRecommendationsCarouselProps {
  title?: string;
  subtitle?: string;
  recommendations: ProductRecommendation[];
  loading?: boolean;
  onViewProduct?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

export const AIRecommendationsCarousel: React.FC<AIRecommendationsCarouselProps> = ({
  title = 'AI Recommendations',
  subtitle = 'Based on customer behavior and product attributes',
  recommendations,
  loading = false,
  onViewProduct,
  onAddToCart,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(300);
  const [visibleCards, setVisibleCards] = useState(3);
  const [connectionLines, setConnectionLines] = useState<SVGSVGElement | null>(null);
  
  // Calculate visible cards based on container width
  useEffect(() => {
    const updateVisibleCards = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Assume we want margins of about 16px and card width of 280px
        const calculatedWidth = 280;
        const calculatedVisibleCards = Math.max(1, Math.floor(containerWidth / (calculatedWidth + 16)));
        
        setCardWidth(calculatedWidth);
        setVisibleCards(calculatedVisibleCards);
      }
    };
    
    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    
    return () => {
      window.removeEventListener('resize', updateVisibleCards);
    };
  }, []);
  
  // Update connection lines between products
  useEffect(() => {
    if (carouselRef.current && recommendations.length > 0 && cardsRef.current.length > 0) {
      // Create or get SVG element for lines
      let svg = connectionLines;
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';
        
        carouselRef.current.appendChild(svg);
        setConnectionLines(svg);
      }
      
      // Clear existing lines
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      
      // Draw connection lines between visible products
      const startIdx = currentIndex;
      const endIdx = Math.min(currentIndex + visibleCards, recommendations.length);
      
      for (let i = startIdx; i < endIdx - 1; i++) {
        const card1 = cardsRef.current[i - startIdx];
        const card2 = cardsRef.current[i + 1 - startIdx];
        
        if (card1 && card2) {
          const rect1 = card1.getBoundingClientRect();
          const rect2 = card2.getBoundingClientRect();
          const carouselRect = carouselRef.current.getBoundingClientRect();
          
          // Create line element
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          
          // Calculate points relative to SVG container
          const x1 = rect1.right - carouselRect.left;
          const y1 = rect1.top + rect1.height / 2 - carouselRect.top;
          const x2 = rect2.left - carouselRect.left;
          const y2 = rect2.top + rect2.height / 2 - carouselRect.top;
          
          // Curve control points
          const cpx = (x1 + x2) / 2;
          
          // Create curved path
          const d = `M ${x1} ${y1} C ${cpx} ${y1}, ${cpx} ${y2}, ${x2} ${y2}`;
          
          // Set line attributes
          line.setAttribute('d', d);
          line.setAttribute('stroke', 'rgba(0, 122, 255, 0.3)');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('fill', 'none');
          line.setAttribute('stroke-dasharray', '5,5');
          
          // Add line to SVG
          svg.appendChild(line);
          
          // Animate line drawing
          gsap.fromTo(line, 
            { strokeDashoffset: 200, opacity: 0 },
            { strokeDashoffset: 0, opacity: 1, duration: 1, ease: 'power2.out' }
          );
        }
      }
    }
  }, [currentIndex, visibleCards, recommendations, connectionLines]);
  
  // Animate carousel movement
  const animateCarousel = (newIndex: number) => {
    if (carouselRef.current) {
      gsap.to(carouselRef.current.querySelector('.carousel-inner'), {
        x: -newIndex * (cardWidth + 16), // card width + margin
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          setCurrentIndex(newIndex);
        }
      });
    }
  };
  
  // Handle next button click
  const handleNext = () => {
    if (currentIndex < recommendations.length - visibleCards) {
      animateCarousel(currentIndex + 1);
    }
  };
  
  // Handle previous button click
  const handlePrevious = () => {
    if (currentIndex > 0) {
      animateCarousel(currentIndex - 1);
    }
  };
  
  // Format price as currency
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Get color for confidence level
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'blue';
    if (confidence >= 0.4) return 'yellow';
    return 'red';
  };
  
  // Get icon for relationship type
  const getRelationshipIcon = (type: ProductRecommendation['relationshipType']) => {
    switch (type) {
      case 'frequently_bought_together':
        return <IconShoppingCart size={16} />;
      case 'similar':
        return <IconBulb size={16} />;
      case 'complementary':
        return <IconStar size={16} />;
      case 'trending':
        return <IconEye size={16} />;
    }
  };
  
  // Get label for relationship type
  const getRelationshipLabel = (type: ProductRecommendation['relationshipType']) => {
    switch (type) {
      case 'frequently_bought_together':
        return 'Frequently Bought Together';
      case 'similar':
        return 'Similar Product';
      case 'complementary':
        return 'Complementary';
      case 'trending':
        return 'Trending';
    }
  };
  
  // Set cardsRef for each card
  const setCardRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      cardsRef.current[index] = el;
    }
  };
  
  // Entrance animation
  useEffect(() => {
    if (containerRef.current && !loading) {
      const header = containerRef.current.querySelector('.carousel-header');
      const cards = containerRef.current.querySelectorAll('.product-card');
      
      const tl = gsap.timeline();
      
      tl.fromTo(header,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      
      tl.fromTo(cards,
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'power2.out' 
        },
        '-=0.3'
      );
    }
  }, [loading, recommendations]);
  
  return (
    <Paper 
      ref={containerRef} 
      p="md" 
      withBorder 
      shadow="sm" 
      className={className}
    >
      <Stack spacing="md">
        <div className="carousel-header">
          <Group position="apart" mb="xs">
            <div>
              <Group spacing="xs">
                <ThemeIcon color="blue" variant="light">
                  <IconBrain size={18} />
                </ThemeIcon>
                <Title order={3}>{title}</Title>
              </Group>
              <Text size="sm" color="dimmed">{subtitle}</Text>
            </div>
            
            <Group spacing="xs">
              <ActionIcon 
                variant="light" 
                disabled={currentIndex === 0}
                onClick={handlePrevious}
                size="lg"
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <ActionIcon 
                variant="light" 
                disabled={currentIndex >= recommendations.length - visibleCards}
                onClick={handleNext}
                size="lg"
              >
                <IconArrowRight size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </div>
        
        <div 
          ref={carouselRef} 
          style={{ 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            className="carousel-inner"
            style={{ 
              display: 'flex', 
              gap: '16px',
              transition: 'transform 0.5s ease',
            }}
          >
            {recommendations.map((product, index) => (
              <div 
                key={product.id}
                ref={(el) => setCardRef(el as HTMLDivElement, index)}
                className="product-card"
                style={{ 
                  flex: `0 0 ${cardWidth}px`,
                  maxWidth: `${cardWidth}px`
                }}
              >
                <Card withBorder p="sm">
                  <Card.Section>
                    <Image
                      src={product.image}
                      alt={product.name}
                      height={180}
                      withPlaceholder
                    />
                  </Card.Section>
                  
                  <Stack spacing="xs" mt="md">
                    <Group position="apart">
                      <Text weight={500} lineClamp={1}>{product.name}</Text>
                      
                      <Badge 
                        color={getConfidenceColor(product.confidence)}
                        size="sm"
                        variant="filled"
                      >
                        {Math.round(product.confidence * 100)}%
                      </Badge>
                    </Group>
                    
                    <Group spacing="xs">
                      <ThemeIcon size="xs" color="blue" variant="light">
                        {getRelationshipIcon(product.relationshipType)}
                      </ThemeIcon>
                      <Text size="xs" color="dimmed">
                        {getRelationshipLabel(product.relationshipType)}
                      </Text>
                    </Group>
                    
                    <Group position="apart" mt="xs">
                      <div>
                        <Text weight={600}>{formatPrice(product.price)}</Text>
                        {product.originalPrice && (
                          <Text size="xs" color="dimmed" style={{ textDecoration: 'line-through' }}>
                            {formatPrice(product.originalPrice)}
                          </Text>
                        )}
                      </div>
                      
                      {product.badges && product.badges.length > 0 && (
                        <Badge color="green" size="sm">
                          {product.badges[0]}
                        </Badge>
                      )}
                    </Group>
                    
                    <Group grow mt="xs">
                      <Button 
                        variant="light" 
                        size="xs"
                        onClick={() => onViewProduct?.(product.id)}
                      >
                        View
                      </Button>
                      <Button 
                        size="xs"
                        onClick={() => onAddToCart?.(product.id)}
                      >
                        Add to Cart
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Stack>
    </Paper>
  );
};

export default AIRecommendationsCarousel;