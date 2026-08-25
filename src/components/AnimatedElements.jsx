import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Staggered container — wrap a list of FadeIn children.
 * Usage:
 *   <Stagger>
 *     {items.map(i => <FadeIn key={i.id}>...</FadeIn>)}
 *   </Stagger>
 */
export function Stagger({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn — child of Stagger, or standalone fade-in.
 */
export function FadeIn({ children, className, direction = 'up', delay = 0 }) {
  const dirs = {
    up: { y: 16, x: 0 },
    down: { y: -16, x: 0 },
    left: { y: 0, x: 16 },
    right: { y: 0, x: -16 },
    none: { y: 0, x: 0 },
  };

  const { x, y } = dirs[direction] || dirs.up;

  return (
    <motion.div
      className={clsx(className)}
      variants={{
        hidden: { opacity: 0, x, y },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn — pop-in animation for cards and modals.
 */
export function ScaleIn({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={clsx(className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn — slides in from a direction.
 */
export function SlideIn({ children, className, from = 'left', delay = 0 }) {
  const offsets = {
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    up: { x: 0, y: 30 },
    down: { x: 0, y: -30 },
  };
  const { x, y } = offsets[from] || offsets.left;

  return (
    <motion.div
      className={clsx(className)}
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
