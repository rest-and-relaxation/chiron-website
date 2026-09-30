(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches || !window.gsap) return;
  const { gsap, ScrollTrigger } = window;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const hero = document.querySelector('.interior-hero');
  const heroTitle = hero?.querySelector('h1');
  const heroDetails = hero?.querySelectorAll('.eyebrow, .interior-hero-meta, .hero-subtitle, .hero-meta, .hero-intro, .hero-anchors');
  if (heroTitle) {
    gsap.timeline({defaults:{ease:'power3.out'}})
      .from(heroTitle,{y:48,autoAlpha:0,duration:1.05,clearProps:'all'})
      .from(heroDetails,{y:20,autoAlpha:0,duration:.7,stagger:.08,clearProps:'all'},'-=.68');
  }

  const reveals = gsap.utils.toArray('.interior-reveal, .reveal');
  reveals.forEach((element) => {
    if (element.closest('.interior-hero')) return;
    gsap.from(element,{
      y:38,autoAlpha:0,duration:.82,ease:'power2.out',clearProps:'all',
      scrollTrigger:{trigger:element,start:'top 88%',once:true}
    });
  });

  if (window.matchMedia('(min-width: 801px)').matches) {
    gsap.utils.toArray('.interior-media img').forEach((img) => {
      gsap.fromTo(img,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
    });
  }
})();
