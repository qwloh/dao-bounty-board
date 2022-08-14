import React from 'react';

import { Copyright } from './Icons/Copyright';
import { Discord } from './Icons/Discord';
import { Github } from './Icons/Github';
import { Twitter } from './Icons/Twitter';

export const Footer = () => (
  <div className="z-10 py-10 flex items-center justify-center transition-all bg-slate-100 dark:bg-night-700">
    <div className="container max-w-screen-xl mx-auto flex flex-col gap-8 items-center justify-center">
      <div className="flex flex-row gap-10 text-slate-100 dark:text-night-600 transition-all">
        <Twitter className="rounded-full cursor-pointer transition-all hover:opacity-60 bg-black text-white dark:bg-white dark:text-black" />
        <Discord className="rounded-full cursor-pointer transition-all hover:opacity-60 bg-black text-white dark:bg-white dark:text-black" />
        <Github className="rounded-full cursor-pointer transition-all hover:opacity-60 bg-black text-white dark:bg-white dark:text-black" />
      </div>
      <div className="flex gap-1 items-center justify-center font-medium text-base">
        <span>Bountiful</span>
        <span>
          <Copyright />
        </span>
        <span>2022</span>
      </div>
    </div>
  </div>
)
