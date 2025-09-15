


import React from 'react';
import { Youtube, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const FooterLanding = () => {
    return (
        <footer className="w-full bg-[#0D0D0D] px-20 font-[Karla]">
            <div className="grid grid-cols-2 gap-8 px-4 py-6 lg:py-8 md:grid-cols-4">
                <div>
                    <h2 className="mb-6 text-sm font-semibold uppercase text-[#D8D8D8]">PRODUCT</h2>
                    <ul className="text-[16px] font-medium text-[#A4A4A4]">
                        <li className="my-3">
                            <a href="#" className="hover:underline">Overview</a>
                        </li>
                        <li className="my-3">
                            <a href="#" className="hover:underline">Acolyte AI</a>
                        </li>
                        <li className="my-3">
                            <a href="#" className="hover:underline">Analytics</a>
                        </li>
                        <li className="my-3">
                            <a href="#" className="hover:underline">Pdf Viewer and Note Taker</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="mb-6 text-sm font-semibold uppercase text-[#D8D8D8]">RESOURCES</h2>
                    <ul className="text-[#A4A4A4] font-medium">
                        <li className="my-3">
                            <a href="#" className="hover:underline">Help Center</a>
                        </li>
                        <li className="my-3">
                            <a href="#" className="hover:underline">Blog</a>
                        </li>
                        <li className="my-3">
                            <a href="#" className="hover:underline">Tutorials</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="mb-6 text-sm font-semibold uppercase text-[#D8D8D8]">SUPPORT</h2>
                    <ul className="text-[#A4A4A4] font-medium">
                        <li className="my-3">
                            <a href="#" className="hover:underline">Contact Support</a>
                        </li>
                        <li className="my-3">
                            <a href="#" className="hover:underline">Feedback</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="mb-6 text-sm font-semibold uppercase text-[#D8D8D8]">COMPANY</h2>
                    <ul className="text-[#A4A4A4] font-medium">
                        <li className="my-3">
                            <a href="#" className="hover:underline">About</a>
                        </li>
                        <li className="my-3">
                            <a href="#" className="hover:underline">Team</a>
                        </li>
                        <li className="my-3">
                            <a href="#" className="hover:underline">Contact</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="px-4 py-6 bg-[#0D0D0D] border-t border-muted md:flex md:items-center md:justify-between space-x-12">
                <span className="text-sm text-[#A4A4A4] sm:text-center">© 2024 Acolyte. All rights reserved
                </span>
                <div className="flex items-center mt-4 sm:justify-center md:mt-0">
                    <div className="flex space-x-6 text-sm text-[#A4A4A4] mr-6">
                        <a href="#" className="hover:text-white">Terms</a>
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Contact</a>
                    </div>

                    <div className="flex space-x-4">
                        <a href="#" className="text-[#A4A4A4] hover:text-white">
                            <Youtube className="w-5 h-4" />
                            <span className="sr-only">YouTube</span>
                        </a>
                        <a href="#" className="text-[#A4A4A4] hover:text-white">
                            <Facebook className="w-5 h-4" fill="#A4A4A4" />
                            <span className="sr-only">Facebook page</span>
                        </a>
                        <a href="#" className="text-[#A4A4A4] hover:text-white">
                            <Twitter className="w-5 h-4" fill="#A4A4A4" />
                            <span className="sr-only">Twitter page</span>
                        </a>
                        <a href="#" className="text-[#A4A4A4] hover:text-white">
                            <Instagram className="w-5 h-4" />
                            <span className="sr-only">Instagram</span>
                        </a>
                        <a href="#" className="text-[#A4A4A4] hover:text-white">
                            <Linkedin className="w-5 h-4" fill="#A4A4A4" />
                            <span className="sr-only">LinkedIn</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterLanding;
