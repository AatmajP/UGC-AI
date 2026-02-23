//import { Check } from 'lucide-react';
//import { PrimaryButton, GhostButton } from './Buttons';
import Title from './Title';
//import { plansData } from '../assets/dummy-data';
//import { motion } from 'framer-motion';
//import { useRef } from 'react';
import { PricingTable } from '@clerk/clerk-react';

export default function Pricing() {

    return (
        <section id="pricing" className="py-20 bg-white/3 border-t border-white/6">
            <div className="max-w-6xl mx-auto px-4">

                <Title
                    title="Pricing"
                    heading="Pricing Plans"
                    description="our Pricing Plans are simple, transparent and flexible.
                    Choose the plan that works best for you."
                />

                <div className="flex flex-wrap items-center justify-center
                 max-w-5xl mx-auto">
                    <PricingTable
                        appearance={{
                            variables: {
                                colorBackground: 'none'
                            },
                            elements: {
                                pricingTableCardBody: 'bg-white/6',
                                pricingTableCardHeader: 'bg-white/10',
                                switchThumb: 'bg-white'
                            }
                        }}
                    />

                </div>
            </div>
        </section>
    );
};