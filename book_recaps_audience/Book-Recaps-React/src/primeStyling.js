import { cn } from "./utils/cn";

export const primeStyling = {
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
        'focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]'
      )
    },
    rotaterighticon: 'w-6 h-6',
    rotateleftbutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]'
      )
    },
    rotatelefticon: 'w-6 h-6',
    zoomoutbutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]'
      )
    },
    zoomouticon: 'w-6 h-6',
    zoominbutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]'
      )
    },
    zoominicon: 'w-6 h-6',
    closebutton: {
      className: cn(
        'flex justify-center items-center',
        'text-white bg-transparent w-12 h-12 rounded-full transition duration-200 ease-in-out mr-2',
        'hover:text-white hover:bg-white/10',
        'focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]'
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
  }
}
