import { cn } from "./utils/cn";

export const primeStyling = {
  global: {
    css: `
        .progress-spinner-circle {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: 0;
            animation: p-progress-spinner-dash 0.9s ease-in-out infinite, p-progress-spinner-color 6s ease-in-out infinite;
            stroke-linecap: round;
        }

        @keyframes p-progress-spinner-dash{
            0% {
                stroke-dasharray: 1, 200;
                stroke-dashoffset: 0;
            }
            
            50% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -35px;
            }
            100% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -124px;
            }
        }
        @keyframes p-progress-spinner-color {
            100%, 0% {
                stroke: #ff5757;
            }
            40% {
                stroke: #696cff;
            }
            66% {
                stroke: #1ea97c;
            }
            80%, 90% {
                stroke: #cc8925;
            }
        }
    `
  },
  progressspinner: {
    root: {
      className: cn('relative mx-auto w-28 h-28 inline-block', 'before:block before:pt-full')
    },
    spinner: 'absolute top-0 bottom-0 left-0 right-0 m-auto w-full h-full transform origin-center animate-spin',
    circle: 'text-red-500 progress-spinner-circle'
  },
  image: {
    root: 'relative inline-block',
    button: {
      className: cn(
        'absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300',
        'bg-transparent text-gray-100',
        'hover:opacity-100 hover:cursor-pointer hover:bg-black hover:bg-opacity-50' //Hover
      )
    },
    mask: {
      className: cn('fixed top-0 left-0 w-full h-full', 'flex items-center justify-center', 'bg-black bg-opacity-90')
    },
    toolbar: {
      className: cn('absolute top-0 right-0 z-10 flex', 'p-4')
    },
    rotaterightbutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0'
      )
    },
    rotaterighticon: 'w-6 h-6',
    rotateleftbutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0'
      )
    },
    rotatelefticon: 'w-6 h-6',
    zoomoutbutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0'
      )
    },
    zoomouticon: 'w-6 h-6',
    zoominbutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0'
      )
    },
    zoominicon: 'w-6 h-6',
    closebutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0'
      )
    },
    closeicon: 'w-6 h-6',
    transition: {
      enterFromClass: 'opacity-0 scale-75',
      enterActiveClass: 'transition-all duration-150 ease-in-out',
      leaveActiveClass: 'transition-all duration-150 ease-in',
      leaveToClass: 'opacity-0 scale-75'
    }
  },
  divider: {
    root: ({ props }) => ({
      className: cn(
        'flex relative', // alignments.
        {
          'w-full my-5 mx-0 py-0 px-5 before:block before:left-0 before:absolute before:top-1/2 before:w-full before:border-t before:border-gray-300': props.layout == 'horizontal', // Padding and borders for horizontal layout.
          'min-h-full mx-4 md:mx-5 py-5 before:block before:min-h-full before:absolute before:left-1/2 before:top-0 before:transform before:-translate-x-1/2 before:border-l before:border-gray-300':
            props.layout == 'vertical' // Padding and borders for vertical layout.
        },
        {
          'before:border-solid': props.type == 'solid',
          'before:border-dotted': props.type == 'dotted',
          'before:border-dashed': props.type == 'dashed'
        } // Border type condition.
      )
    }),
    content: 'px-1 bg-white z-10' // Padding and background color.
  },
  contextmenu: {
    root: 'py-1 bg-white text-gray-700 border-none shadow-md rounded-lg w-52',
    menu: {
      className: cn('m-0 p-0 list-none', 'outline-none')
    },
    menuitem: 'relative',
    content: ({ context }) => ({
      className: cn(
        'transition-shadow duration-200 rounded-none',
        'hover:text-gray-700 hover:bg-gray-200', // Hover
        {
          'text-gray-700': !context.focused && !context.active,
          'bg-gray-300 text-gray-700': context.focused && !context.active,
          'bg-blue-500 text-blue-700': context.focused && context.active,
          'bg-blue-50 text-blue-700': !context.focused && context.active
        }
      )
    }),
    action: {
      className: cn('cursor-pointer flex items-center no-underline overflow-hidden relative', 'text-gray-700 py-3 px-5 select-none')
    },
    icon: 'text-gray-600 mr-2',
    label: 'text-gray-600',
    transition: {
      timeout: { enter: 250 },
      classNames: {
        enter: 'opacity-0',
        enterActive: '!opacity-100 transition-opacity duration-250'
      }
    }
  },
  tooltip: {
    root: ({ context }) => {
      return {
        className: cn('absolute shadow-md', {
          'py-0 px-1': context.right || context.left || (!context.right && !context.left && !context.top && !context.bottom),
          'py-1 px-0': context.top || context.bottom
        })
      };
    },
    arrow: ({ context }) => ({
      className: cn('absolute w-0 h-0 border-transparent border-solid', {
        '-mt-1 border-y-[0.25rem] border-r-[0.25rem] border-l-0 border-r-gray-600': context.right,
        '-mt-1 border-y-[0.25rem] border-l-[0.25rem] border-r-0 border-l-gray-600': context.left,
        '-ml-1 border-x-[0.25rem] border-t-[0.25rem] border-b-0 border-t-gray-600': context.top,
        '-ml-1 border-x-[0.25rem] border-b-[0.25rem] border-t-0 border-b-gray-600': context.bottom
      })
    }),
    text: {
      className: 'p-3 bg-gray-600 text-white text-sm tracking-wide rounded-md whitespace-pre-line break-words'
    }
  },
  inputtext: {
    root: ({ props, context }) => ({
      className: cn(
        'm-0',
        'font-sans text-gray-600 border transition-colors duration-200 appearance-none rounded-lg',
        {
          'focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]':
            !context.disabled,
          'hover:border-blue-500': !props.invalid && !context.disabled,
          'opacity-60 select-none pointer-events-none cursor-default': context.disabled,
          'border-gray-300': !props.invalid,
          'border-red-500 hover:border-red-500/80 focus:border-red-500':
            props.invalid && !context.disabled,
          'border-red-500/50': props.invalid && context.disabled,
        },
        {
          'text-lg px-3 py-3': props.size === 'large',
          'text-xs px-2 py-2': props.size === 'small',
          'p-2 text-base': !props.size || typeof props.size === 'number'
        },
        {
          'pl-8': context.iconPosition === 'left',
          'pr-8': props.iconPosition === 'right'
        }
      ),
    }),
  },
  dialog: {
    root: ({ state }) => ({
      className: cn('rounded-lg border-0', 'max-h-[90%] transform scale-100', 'm-0 w-[50vw]', {
        'transition-none transform-none !w-screen !h-screen !max-h-full !top-0 !left-0': state.maximized
      })
    }),
    header: {
      className: cn('flex items-center justify-between shrink-0', 'bg-white text-gray-800 border-t-0  rounded-tl-lg rounded-tr-lg p-6')
    },
    headerTitle: 'font-bold text-lg',
    headerIcons: 'flex items-center',
    closeButton: {
      className: cn(
        'flex items-center justify-center overflow-hidden relative',
        'w-8 h-8 text-gray-500 border-0 bg-transparent rounded-full transition duration-200 ease-in-out mr-2 last:mr-0',
        'hover:text-gray-700 hover:border-transparent hover:bg-gray-200',
        'focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]', // focus
      )
    },
    closeButtonIcon: 'w-4 h-4 inline-block',
    content: ({ state }) => ({
      className: cn('overflow-y-auto', 'bg-white text-gray-700 px-6 pb-8 pt-0', 'rounded-bl-lg rounded-br-lg', {
        grow: state.maximized
      })
    }),
    footer: {
      className: cn('shrink-0 ', 'border-t-0 bg-white text-gray-700 px-6 pb-6 text-right rounded-b-lg')
    },
    mask: ({ state }) => ({
      className: cn('transition duration-200', { 'bg-black/40': state.containerVisible })
    }),
    transition: ({ props }) => {
      return props.position === 'top'
        ? {
          enterFromClass: 'opacity-0 scale-75 translate-x-0 -translate-y-full translate-z-0',
          enterActiveClass: 'transition-all duration-200 ease-out',
          leaveActiveClass: 'transition-all duration-200 ease-out',
          leaveToClass: 'opacity-0 scale-75 translate-x-0 -translate-y-full translate-z-0'
        }
        : props.position === 'bottom'
          ? {
            enterFromClass: 'opacity-0 scale-75 translate-y-full',
            enterActiveClass: 'transition-all duration-200 ease-out',
            leaveActiveClass: 'transition-all duration-200 ease-out',
            leaveToClass: 'opacity-0 scale-75 translate-x-0 translate-y-full translate-z-0'
          }
          : props.position === 'left' || props.position === 'top-left' || props.position === 'bottom-left'
            ? {
              enterFromClass: 'opacity-0 scale-75 -translate-x-full translate-y-0 translate-z-0',
              enterActiveClass: 'transition-all duration-200 ease-out',
              leaveActiveClass: 'transition-all duration-200 ease-out',
              leaveToClass: 'opacity-0 scale-75  -translate-x-full translate-y-0 translate-z-0'
            }
            : props.position === 'right' || props.position === 'top-right' || props.position === 'bottom-right'
              ? {
                enterFromClass: 'opacity-0 scale-75 translate-x-full translate-y-0 translate-z-0',
                enterActiveClass: 'transition-all duration-200 ease-out',
                leaveActiveClass: 'transition-all duration-200 ease-out',
                leaveToClass: 'opacity-0 scale-75 opacity-0 scale-75 translate-x-full translate-y-0 translate-z-0'
              }
              : {
                enterFromClass: 'opacity-0 scale-75',
                enterActiveClass: 'transition-all duration-200 ease-out',
                leaveActiveClass: 'transition-all duration-200 ease-out',
                leaveToClass: 'opacity-0 scale-75'
              };
    }
  },
  message: {
    root: ({ props }) => ({
      className: cn('flex items-center justify-start align-top', 'p-3 m-0 rounded-md', {
        'bg-blue-100 border-0 text-blue-700': props.severity == 'info',
        'bg-green-100 border-0 text-green-700': props.severity == 'success',
        'bg-orange-100 border-0 text-orange-700': props.severity == 'warn',
        'bg-red-100 border-0 text-red-700': props.severity == 'error'
      })
    }),
    icon: 'text-base mr-2'
  }
}
