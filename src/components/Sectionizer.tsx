import React from "react";


/**
 * Sectionizer takes the components its wrapping and adds section numbers to the headings. Its
 * designed specifically for this projects mdx files and tailwind ui.
 * 
 * Specifically, it adds section numbers to h2, h3, and h4 elements and adds a hr element before
 * each h2 element. 
 * 
 * Usage:
 * <Sectionizer>
 *     ## Heading 1
 *     ### Heading 2
 *     #### Heading 3
 *     ## Heading 4
 *     ### Heading 5
 * </Sectionizer
 * 
 * Output:
 * <hr />
 * <h2>§1 Heading 1</h2>
 * <h3>§1.1 Heading 2</h3>
 * <h4>§1.1.1 Heading 3</h4
 * <hr />
 * <h2>§2 Heading 4</h2>
 * <h3>§2.1 Heading 5</h3>
 * 
 * @param children the children to sectionize
 * @param startValues starting values for the sections. [h2, h3, h4]
 * @constructor
 */
export default function Sectionizer({ children, startValues = [1, 1, 1] }: { children: React.ReactNode, startValues?: number[] }) {
    
    // Supports h2 to h4
    const actualStartValues = startValues;
    for (let i = 0; i < 3; i++) {
        actualStartValues[i] -= 1;
    }
    const currentSections = [...actualStartValues]

    const sectionizedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            // If the child is a heading2 element as its automcatically compiled to a function instead of a string
            if (typeof child.type === "function") {
                currentSections[0] += 1;
                currentSections[1] = actualStartValues[1]
                currentSections[2] = actualStartValues[2]

                // Insert a horizontal rule and the section number before the heading
                return (
                    <React.Fragment>
                        <hr />
                        {React.cloneElement(child as React.ReactElement, { children: `§${currentSections[0]} ${child.props.children}` })}
                    </React.Fragment>
                );
            }
            
            if (child.type === "h3") {
                currentSections[1] += 1;
                currentSections[2] = actualStartValues[2]
                
                return React.cloneElement(child as React.ReactElement, {
                    children: '§' + currentSections[0] + '.' + currentSections[1] + ' ' + child.props.children
                });
            }
            
            if (child.type === "h4") {
                currentSections[2] += 1;
                
                return React.cloneElement(child as React.ReactElement, {
                    children: '§' + currentSections[0] + '.' + currentSections[1] + '.' + currentSections[2] + ' ' + child.props.children
                });
            }
        }
        return child;
    });
    
    return <>{sectionizedChildren}</>;
}
