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
  }
}
