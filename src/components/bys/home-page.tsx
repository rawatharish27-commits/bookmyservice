'use client';

import React from 'react';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  CalendarCheck,
  CheckCircle2,
  Star,
  Shield,
  CreditCard,
  Headphones,
  Award,
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Wrench,
  Zap,
  Paintbrush,
  Droplets,
  Plug,
  Hammer,
  Scissors,
  Wind,
  ShieldCheck,
  Home as HomeIcon,
  Building,
  TreePine,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  subcategoriesCount: number;
  servicesCount: number;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  priceNegotiable: boolean;
  averageRating: number;
  totalBookings: number;
  totalReviews: number;
  city?: string;
  images?: string;
  provider: { id: string; name: string; profileImageUrl?: string };
  category: { id: number; name: string; slug: string };
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="size-6" />,
  Zap: <Zap className="size-6" />,
  Paintbrush: <Paintbrush className="size-6" />,
  Droplets: <Droplets className="size-6" />,
  Plug: <Plug className="size-6" />,
  Hammer: <Hammer className="size-6" />,
  Scissors: <Scissors className="size-6" />,
  Wind: <Wind className="size-6" />,
  ShieldCheck: <ShieldCheck className="size-6" />,
  Home: <HomeIcon className="size-6" />,
  Building: <Building className="size-6" />,
  TreePine: <TreePine className="size-6" />,
};

function getCategoryIcon(iconName?: string): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
  return <Sparkles className="size-6" />;
}

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Homeowner',
    rating: 5,
    quote: 'BookYourService made it so easy to find a reliable plumber. The booking process was smooth and the service was excellent!',
    initials: 'PS',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Service Provider',
    rating: 5,
    quote: 'As a provider, this platform has helped me grow my business significantly. The scheduling and payment systems work flawlessly.',
    initials: 'RK',
  },
  {
    name: 'Anita Desai',
    role: 'Regular Customer',
    rating: 5,
    quote: 'I have been using this platform for 6 months now. Every service professional has been verified and professional. Highly recommend!',
    initials: 'AD',
  },
];

function CategorySkeleton() {
  return (
    <Card className="rounded-xl">
      <CardContent className="flex flex-col items-center gap-2 p-4">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}

function ServiceSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-2 h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </CardContent>
    </Card>
  );
}

export function HomePage() {
  const { navigate } = useApp();
  const { user } = useAuth();

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useApi<Category[]>('/api/categories');
  const { data: servicesData, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useApi<{ services: ServiceItem[]; pagination: { total: number } }>('/api/services?limit=6');

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const services = servicesData?.services || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <Sparkles className="mr-1 size-3" /> Trusted by 10,000+ customers
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Find Trusted{' '}
                <span className="text-emerald-600">Home Service Professionals</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Book verified professionals for cleaning, plumbing, electrical work, and more.
                Get quality service with our satisfaction guarantee.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate('categories')}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Browse Services
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                {!user && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('register')}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Join as a Provider
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 opacity-50 blur-2xl" />
                <img
                  src="/hero-illustration.png"
                  alt="BookYourService - Find trusted home service professionals"
                  className="relative w-full drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: 'Bookings', value: '10,000+', icon: <CalendarCheck className="size-5 text-emerald-600" /> },
              { label: 'Providers', value: '5,000+', icon: <Users className="size-5 text-emerald-600" /> },
              { label: 'Average Rating', value: '4.8★', icon: <Star className="size-5 text-emerald-600" /> },
              { label: 'Categories', value: '50+', icon: <Sparkles className="size-5 text-emerald-600" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Getting started is simple and takes just a few minutes</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Search & Compare',
                description: 'Browse through our verified service providers, read reviews, and compare prices to find the perfect match.',
                icon: <Search className="size-6" />,
              },
              {
                step: '2',
                title: 'Book & Schedule',
                description: 'Choose your preferred time slot, confirm your booking, and pay securely through our platform.',
                icon: <CalendarCheck className="size-6" />,
              },
              {
                step: '3',
                title: 'Get It Done',
                description: 'A verified professional arrives on time, completes the work, and you leave a review for the community.',
                icon: <CheckCircle2 className="size-6" />,
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative text-center">
                {idx < 2 && (
                  <div className="absolute right-0 top-8 hidden translate-x-1/2 sm:block">
                    <ArrowRight className="size-5 text-emerald-300" />
                  </div>
                )}
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  {item.icon}
                </div>
                <div className="mx-auto mt-4 flex size-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular Categories</h2>
              <p className="mt-2 text-muted-foreground">Explore our most requested service categories</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('categories')}
              className="hidden text-emerald-600 hover:text-emerald-700 sm:inline-flex"
            >
              View All <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>

          {categoriesError ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">Failed to load categories</p>
              <Button variant="outline" size="sm" onClick={refetchCategories} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categoriesLoading
                ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
                : categories.slice(0, 6).map((cat) => (
                    <Card
                      key={cat.id}
                      className="cursor-pointer rounded-xl transition-all hover:border-emerald-200 hover:shadow-md"
                      onClick={() => navigate('category-detail', { categoryId: String(cat.id) })}
                    >
                      <CardContent className="flex flex-col items-center gap-2 p-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <span className="text-center text-sm font-medium">{cat.name}</span>
                        {cat.servicesCount > 0 && (
                          <span className="text-xs text-muted-foreground">{cat.servicesCount} services</span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate('categories')} className="border-emerald-200 text-emerald-600">
              View All Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured Services</h2>
              <p className="mt-2 text-muted-foreground">Top-rated services from verified providers</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('search')}
              className="hidden text-emerald-600 hover:text-emerald-700 sm:inline-flex"
            >
              View All <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>

          {servicesError ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">Failed to load services</p>
              <Button variant="outline" size="sm" onClick={refetchServices} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicesLoading
                ? Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
                : services.map((service) => (
                    <Card
                      key={service.id}
                      className="cursor-pointer overflow-hidden rounded-xl transition-all hover:border-emerald-200 hover:shadow-md"
                      onClick={() => navigate('service-detail', { serviceId: service.id })}
                    >
                      <div className="relative aspect-video bg-gradient-to-br from-emerald-50 to-teal-50">
                        {service.images ? (
                          <img
                            src={JSON.parse(service.images)[0] || ''}
                            alt={service.title}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Wrench className="size-12 text-emerald-300" />
                          </div>
                        )}
                        {service.priceNegotiable && (
                          <Badge className="absolute right-2 top-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
                            Negotiable
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold leading-tight">{service.title}</h3>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span>{service.provider.name}</span>
                          {service.city && (
                            <>
                              <span>·</span>
                              <MapPin className="size-3" />
                              <span>{service.city}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{service.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({service.totalReviews})</span>
                          </div>
                          <span className="text-lg font-bold text-emerald-600">₹{service.basePrice}</span>
                        </div>
                        <Button
                          size="sm"
                          className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('service-detail', { serviceId: service.id });
                          }}
                        >
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate('search')} className="border-emerald-200 text-emerald-600">
              View All Services
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What Our Users Say</h2>
            <p className="mt-3 text-muted-foreground">Real experiences from our community</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-emerald-100 text-sm font-medium text-emerald-700">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Become a Service Provider
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-emerald-100">
            Join our growing network of professionals. Reach thousands of customers, manage your
            schedule, and grow your business with BookYourService.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-emerald-50"
              onClick={() => navigate('register')}
            >
              Join as Provider
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-300 text-white hover:bg-emerald-700"
              onClick={() => navigate('how-it-works')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why Trust Us</h2>
            <p className="mt-3 text-muted-foreground">Your safety and satisfaction are our top priorities</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { icon: <Shield className="size-8" />, title: 'KYC Verified', description: 'All providers undergo identity verification' },
              { icon: <CreditCard className="size-8" />, title: 'Secure Payments', description: 'Your transactions are protected and encrypted' },
              { icon: <Award className="size-8" />, title: 'Satisfaction Guarantee', description: 'Full refund if you are not satisfied' },
              { icon: <Headphones className="size-8" />, title: '24/7 Support', description: 'Round-the-clock customer assistance' },
            ].map((badge) => (
              <div key={badge.title} className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  {badge.icon}
                </div>
                <h3 className="mt-4 text-sm font-semibold">{badge.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
