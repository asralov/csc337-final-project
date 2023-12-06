document.addEventListener('DOMContentLoaded', () => {
    const headings = document.querySelectorAll('.container h2');

    headings.forEach(heading => {
        heading.addEventListener('click', () => {
            const info = heading.nextElementSibling;

            // Check if the next element is of class 'info'
            if (info && info.classList.contains('info')) {
                // Toggle content visibility
                info.style.display = info.style.display === 'none' ? 'block' : 'none';

                // Get the icon within the heading
                const icon = heading.querySelector('i');

                // Toggle icon class
                if (icon.classList.contains('bxs-right-arrow')) {
                    icon.classList.remove('bxs-right-arrow');
                    icon.classList.add('bxs-down-arrow');
                } else {
                    icon.classList.remove('bxs-down-arrow');
                    icon.classList.add('bxs-right-arrow');
                }
            }
        });
    });
});
