---
description: >-
  This section will highlight the changes made between the 1.1 and 1.2
  specifications. In particular, changes in the platform layer/runtime, OpenCL
  C, and deprecated functions will be discussed.
---

# Changes made in update from 1.1 to 1.2

### _Changes in the OpenCL Platform Layer and the Runtime_&#x20;

**Custom Device**&#x20;

Some devices may have the OpenCL Runtime fully implemented, but do not support kernel-programming using OpenCL C. Such a device is categorized as a custom device. Non-programmable chips like ASIC, and DSPs that require specialized programming methods, are some examples of custom devices.&#x20;

Although OpenCL C may not be supported, a custom device may support an online compiler to generate machine codes to be executed on the device. Kernel program may be created from source using clCreateProgramWithSource() if an online compiler exists, from a binary, or from built-in kernels.&#x20;

**Built-in Kernel**&#x20;

A built-in kernel is a non-programmable kernel provided in the OpenCL implementation which utilizes fixed-function hardware or firmware. A list of built-in kernels can be queried from the application. Note that when creating an OpenCL program object, built-in kernels and OpenCL C kernels must be separate objects.&#x20;

A few changes were made to the runtime APIs to take into account for the addition of custom devices and built-in kernels described above.&#x20;

 The following can now be passed in as the 2nd argument to clGetDeviceInfo():&#x20;

| cl\_device\_info                | Return Type                   | Description                                                                                                                                |
| ------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| CL\_DEVICE\_BUILT\_IN\_KERNELS  | char\[]                       | Returns a semi-colon separated list of built-in kernels. An empty string is returned if the device does not support any built-in kernels.  |
| CL\_DEVICE\_LOCAL\_MEM\_TYPE    | cl\_device, local\_mem\_type  | <p>Returns the type of local memory supported. CL_NONE may be returned for custom devices with no local memory support. <br></p>           |

 clCreateProgramWithBuiltInKernels&#x20;

This function is used to create an OpenCL program object from built-in kernels.&#x20;

> cl\_program clCreateProgramWithBuiltInKernels (
>
> cl\_context context, // context object to associate with&#x20;
>
> cl\_uint num\_devices, // number of elements in _device\_list_&#x20;
>
> const cl\_device\_id \*device\_list, // list of devices&#x20;
>
> const char \*kernel\_names, // kernel names to load&#x20;
>
> cl\_int \*errcode\_ret) // error code&#x20;

Upon successful execution, a non-NULL program object will be returned, with errcode\_ret set to CL\_SUCCESS. If an error occurs, NULL will be returned, with errcode\_ret set to the appropriate error code. The 4th parameter takes a semi-colon separated list of built-in kernels from which to create the program object from.\


 The following can now be passed as the 3rd argument to clCreateProgramWithBuiltInKernels()&#x20;

| cl\_kernel\_work\_group\_info   | Return Type  | Description                                                            |
| ------------------------------- | ------------ | ---------------------------------------------------------------------- |
| CL\_KERNEL\_GLOBAL\_WORK\_SIZE  | Size\_t\[3]  | Returns the maximum global size that can be used to execute a kernel.  |

**Device Partitioning**&#x20;

Starting with OpenCL 1.2, an OpenCL device may be partitioned into multiple sub-devices to be used independently of each other. The partitioning is performed in order of compute units. Any device being partitioned is called the parent device, and the original device from which the partitions are created is called the root device (**Figure 7.1**).&#x20;

**Figure7.1: Overview of device partitioning**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-12 at 11.07.44 PM.png>)

A sub-device is created using the following API.

> cl\_int clCreateSubDevices(cl\_device\_id in\_device, // parent device&#x20;
>
> const cl\_device\_partition\_property \*properties, // partition properties&#x20;
>
> cl\_uint num\_devices, // number of elements in _out\_devices_&#x20;
>
> cl\_device\_id \*out\_devices, // buffer to store returned sub-device IDs&#x20;
>
> cl\_uint \*num\_devices\_ret) // number of sub-devices actually created&#x20;

The properties passed in as the 2nd argument should have one of the 3 formats:

> {CL\_DEVICE\_PARTITION\_EQUALLY, uint numComputeUnits, 0}&#x20;
>
> {CL\_DEVICE\_PARTITION\_BY\_COUNTS, uint numComputeUnitsA, uint numComputeUnitsB, ..., 0}&#x20;
>
> {CL\_DEVICE\_PARTITION\_BY\_AFFINITY\_DOMAIN, cl\_device\_affinity\_domain, 0}&#x20;

In all 3 cases, the last argument passed in must be 0. The description of the 1st argument passed in is as follows.

| Partition mode                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CL\_DEVICE\_PARTITION\_EQUALLY               | Partition compute units such that each partition contains the number of compute units specified in the 2nd argument inside _properties_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CL\_DEVICE\_PARTITION\_BY\_COUNTS            | Partition compute units according to the numbers passed in as 2nd to 2nd to last argument inside properties                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CL\_DEVICE\_PARTITION\_BY\_AFFINITY\_DOMAIN  | <p>Split the device into smaller aggregate devices containing compute units that all share part of a cache hierarchy. The 2nd argument inside properties must be one of the following. </p><p>CL_DEVICE_AFFINITY_DOMAIN_NUMA: compute units CL_DEVICE_PARTITION_BY_AFFINITY_DOMAIN share a NUMA node </p><p>CL_DEVICE_AFFINITY_DOMAIN_L4_CACHE: compute units share a level 4 data cache </p><p>CL_DEVICE_AFFINITY_DOMAIN_L3_CACHE: compute units share a level 3 data cache </p><p>CL_DEVICE_AFFINITY_DOMAIN_L2_CACHE: compute units share a level 2 data cache </p><p>CL_DEVICE_AFFINITY_DOMAIN_L1_CACHE: compute units share a level 1 data cache </p><p>CL_DEVICE_AFFINITY_DOMAIN_NEXT_PARTITIONABLE: compute units share memory subsystem at the next partitionable affinity domain, with the order being NUMA, L4, L3, L2, L1. </p> |

For example, to split a device containing 16 compute units to sub-devices such that each sub-device contains 8 compute units, thereby creating 2 sub-devices with 8 compute units each, pass the following in _properties_:&#x20;

> { CL\_DEVICE\_PARTITION\_EQUALLY, 8, 0 }

To partition a device containing 4 compute units such that one sub-device contains 3 compute units and the other sub-device contains 1 compute units, pass the following in _properties_:&#x20;

> { CL\_DEVICE\_PARTITION\_BY\_COUNTS, 3, 1,&#x20;
>
> CL\_DEVICE\_PARTITION\_BY\_COUNTS\_LIST\_END, 0 }

To split a device along the outermost cache line, pass the following in _properties_:&#x20;

> { CL\_DEVICE\_PARTITION\_BY\_AFFINITY\_DOMAIN,&#x20;
>
> CL\_DEVICE\_AFFINITY\_DOMAIN\_NEXT\_PARTITIONABLE, 0 }&#x20;

**cl\_mem\_flags**&#x20;

cl\_mem\_flags, which is set when creating buffer objects or image objects using clCreateBuffer, clCreateSubBuffer, or clCreateImage, now has the following additional flags that can be set.&#x20;

| cl\_mem\_flags              | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| CL\_MEM\_HOST\_WRITE\_ONLY  | The host will only write to the memory object.                   |
| CL\_MEM\_HOST\_READ\_ONLY   | The host will only read from the memory object.                  |
| CL\_MEM\_HOST\_NO\_ACCESS   | The host will neither read from nor write to the memory object.  |

Note that CL\_MEM\_HOST\_WRITE\_ONLY and CL\_MEM\_HOST\_READ\_ONLY cannot be specified together. Also, if CL\_MEM\_HOST\_NO\_ACCESS is set, neither CL\_MEM\_HOST\_WRITE\_ONLY nor CL\_MEM\_HOST\_READ\_ONLY can also be set.&#x20;

If cl\_mem\_flags is set to 0, the default value will be CL\_MEM\_READ\_WRITE. However, when creating an image object from a buffer object (which can be passed in as a parameter in cl\_image\_desc for clCreateImage), the flag will inherit that of the buffer instead (See 7.2.2).&#x20;

**cl\_map\_flag**&#x20;

Device memory in buffer objects and image objects can be mapped to the host-side memory using clEnqueueMapBuffer and clEnqueueMapImage. In OpenCL 1.2, the following cl\_map\_flag was added, which sets the property of the host-side memory.&#x20;

| cl\_map\_flag                       | Description                                                                                                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CL\_MAP\_WRITE\_INVALIDATE\_REGION  | This flag specifies that the host-side memory is mapped only for writing. As such, any changes made to the host-side memory will not be reflected to the device-side memory.  |

Unlike in CL\_MAP\_WRITE supported in OpenCL 1.0/1.1, there is no guarantee that the pointer returned by clEnqueueMapBuffer and clEnqueueMapImage reflects the latest content of the memory object on the device, since the host can make changes to this memory region as much as it wants. This can be a performance enhancement, as it eliminates memory transfers from the host to the device every time a change is made.

> CL\_MAP\_WRITE\_INVALIDATE\_REGION cannot be specified with CL\_MAP\_READ or CL\_MAP\_WRITE.

**Fill Buffer with pattern**&#x20;

OpenCL 1.2 added a new API to fill a buffer object on the device with a certain pattern.&#x20;

> cl\_int clEnqueueFillBuffer(cl\_command\_queue command\_queue,&#x20;
>
> cl\_mem buffer, // buffer to fill&#x20;
>
> const void \*pattern, // data pattern to fill with&#x20;
>
> size\_t pattern\_size, // size of the data pattern&#x20;
>
> size\_t offset, // offset to start the filling from (in Bytes)&#x20;
>
> size\_t size, // number of bytes to fill&#x20;
>
> cl\_uint num\_events\_in\_wait\_list,&#x20;
>
> const cl\_event \*event\_wait\_list,&#x20;
>
> cl\_event \*event)

This function fills the buffer starting from offset for a number of bytes specified by size. Note that size must be an integer multiple of pattern\_size.&#x20;

Similarly, the following function is used to fill an image object on the device with a certain pattern.&#x20;

> cl\_int clEnqueueFilleImage(cl\_command\_queue command\_queue,&#x20;
>
> cl\_mem image, // image object to fill&#x20;
>
> const void \*fill\_color, // color to fill with&#x20;
>
> const size\_t \*origin, // coordinates to start the fill&#x20;
>
> const size\_t \*region, // area to fill&#x20;
>
> cl\_uint num\_events\_in\_wait\_list,&#x20;
>
> const cl\_event \*event\_wait\_list,&#x20;
>
> cl\_event \*event)&#x20;

Note that fill\_color corresponds to the channel data type of the image object.&#x20;

 signed RGBA if channel data is un-normalized, signed integer&#x20;

 unsigned RGBA if channel data is un-normalize, unsigned integer&#x20;

 float RGBA otherwise&#x20;

\


The origin is a 3-element vector, each corresponding to x, y, z dimension, respectively. If image is a 2D image object, origin\[2] should be 0. If image is 1D image or 1D image buffer object, both origin\[1] and origin\[2] should be 0. If image is a 1D image array object, origin\[1] is the image index in the 1D image array. If image is a 2D image array object, origin\[2] is the image index in the 2D image array. (See 7.2.2 for new image data formats)&#x20;

The region is similarly a 3-element vector, each corresponding to width, height, and depth. If image is a 2D image object or an 1D image array object, region\[2] should be set to 1. If image is an 1D image object or an 1D image buffer object, both region\[1] and region\[2] should be set to 1.&#x20;

**clCreateImage()**&#x20;

Up until OpenCL 1.1, image objects were created with clCreateImage2D and clCreateImage3D. In OpenCL 1.2, those functions are now deprecated. Instead, more generic, clCreateImage will take its place. This function can be used also for the newly supported 1D image object, 1D image buffer object, and 2D image array object.

> cl\_mem clCreateImage(cl\_context context,&#x20;
>
> cl\_mem\_flags flags,&#x20;
>
> const cl\_image\_format \*image\_format,&#x20;
>
> const cl\_image\_desc \*image\_desc,&#x20;
>
> void \*host\_ptr,&#x20;
>
> cl\_int \*errcode\_ret)&#x20;

From now on, this function will be used to create image objects.&#x20;

context is the context for which to associate the image. flags is the same as the one used in clCreateBuffer to set read/write properties for the memory region. host\_ptr points to the memory region to copy the image data from. This may be a memory region already associated with another object, but the data size of the accessed area must exceed that of the image object. errcode\_ret is the error code returned.&#x20;

image\_format is a structure with the following format.&#x20;

> typedef struct \_cl\_image\_format {&#x20;
>
> cl\_channel\_order image\_channel\_order;&#x20;
>
> cl\_channel\_type image\_channel\_data\_type;&#x20;
>
> } cl\_image\_format;&#x20;

image\_channel\_order specifies the number of channels, as well as the order of the channels (See **Figure 5.6**).&#x20;

image\_channel\_data\_type specifies the data type of each channels (See **Figure 5.6**)&#x20;

image\_desc is a structure with the following format.&#x20;

> typedef struct \_cl\_image\_desc {&#x20;
>
> cl\_mem\_object\_type image\_type,&#x20;
>
> size\_t image\_width;&#x20;
>
> size\_t image\_height;&#x20;
>
> size\_t image\_depth;&#x20;
>
> size\_t image\_array\_size;&#x20;
>
> size\_t image\_row\_pitch;&#x20;
>
> size\_t image\_slice\_pitch;&#x20;
>
> cl\_uint num\_mip\_levels;&#x20;
>
> cl\_uint num\_samples;&#x20;
>
> cl\_mem buffer;&#x20;
>
> } cl\_image\_desc;&#x20;

image\_type is set to one of the following, whose description will be discussed in the next chapter.

> CL\_MEM\_OBJECT\_IMAGE1D&#x20;
>
> CL\_MEM\_OBJECT\_IMAGE1D\_BUFFER&#x20;
>
> CL\_MEM\_OBJECT\_IMAGE1D\_ARRAY&#x20;
>
> CL\_MEM\_OBJECT\_IMAGE2D&#x20;
>
> CL\_MEM\_OBJECT\_IMAGE2D\_ARRAY&#x20;
>
> CL\_MEM\_OBJECT\_IMAGE3D&#x20;

image\_width is the number of pixels contained in the horizontal direction of the image. Its value must meet the following criteria.&#x20;

 2D image, 2D image array: image\_width < CL\_DEVICE\_IMAGE2D\_MAX\_WIDTH&#x20;

 3D image: image\_width < CL\_DEVICE\_IMAGE3D\_MAX\_WIDTH&#x20;

 1D image buffer: image\_width < CL\_DEVICE\_IMAGE\_MAX\_BUFFER\_SIZE&#x20;

 1D image, 1D image array: image\_width <= CL\_DEVICE\_IMAGE2D\_MAX\_WIDTH&#x20;

\


image\_height is the number of pixels contained in the vertical direction of the image. This parameter is used only for 2D image, 3D image, and 2D image array. Its value must meet the following criteria.&#x20;

 2D image, 2D image array: image\_height <= CL\_DEVICE\_IMAGE\_2D\_MAX\_HEIGHT&#x20;

\


 3D image: image\_height <= CL\_DEVICE\_IMAGE3D\_MAX\_HEIGHT&#x20;

image\_depth is the number of pixels in the image depth. This parameter is used only for a 3D image. Its value must meet the following criteria:&#x20;

 1 <= image\_depth && image\_depth <= CL\_DEVICE\_IMAGE3D\_MAX\_DEPTH&#x20;

\


image\_array\_size is the number of images in the image array. This parameter is used for 1D image array and 2D image array. Its value must meet the following criteria.&#x20;

 1 <= image\_array\_size && image\_array\_size <= CL\_DEVICE\_IMAGE\_MAX\_ARRAY\_SIZE&#x20;

\


image\_row\_pitch is the scan-line pitch in bytes. This value should be 0 if host\_ptr is NULL. If host\_ptr is not NULL, this value should be set to 0 or pitch \* size of elements in bytes. If 0 is set, the value is calculated automatically. The pitch must be greater than or equal to image\_width.&#x20;

image\_slice\_pitch is the size in bytes of each 2D slice in the 3D image or the size in bytes of each image in a 1D or 2D image array. This must be set to 0 if host\_ptr is NULL. If host\_ptr is not NULL, this value should be set to either 0 or the appropriate value of the slice pitch. If 0 is set, the value is calculated automatically.&#x20;

num\_mip\_levels and num\_samples must be set to 0.&#x20;

buffer is specified when creating a 1D image buffer object from an existing buffer object on the device. In all other cases, it must be NULL. The buffer size of the new image must be less than or equal to the buffer object from which to create the image.&#x20;

**Figure 7.2: Image object parameters**&#x20;

![](<../.gitbook/assets/Screen Shot 2022-01-12 at 11.16.05 PM.png>)

By setting the parameters as described, clCreateImage allows creation of all types of images.&#x20;

**clEnqueueMigrateMemObjects**&#x20;

This function allows for migration of memory objects to a specific device.&#x20;

> cl\_int clEnqueueMigrateMemObjects(&#x20;
>
> cl\_command\_queue command\_queue,&#x20;
>
> cl\_uint num\_mem\_objects,&#x20;
>
> const cl\_mem \*mem\_objects,&#x20;
>
> cl\_mem\_migration\_flags flags,&#x20;
>
> cl\_uint num\_events\_in\_wait\_list,&#x20;
>
> const cl\_evenet \*event\_wait\_list,&#x20;
>
> cl\_event \*event)&#x20;

This provides a mechanism for explicit control over the location of memory object, which may be necessary in an environment with multiple devices for efficient access to memory. The flags can be specified the following values.

| cl\_mem\_migration\_flags        | Description                                                        |
| -------------------------------- | ------------------------------------------------------------------ |
| CL\_MIGRATE\_MEM\_OBJECT\_HOST   | Indicates that the memory objects are to be migrated to the host.  |
| CL\_MIGRATE\_MEM\_OBJECT\_CONTEN | Indicates that the data within the object is not                   |
| T\_UNDEFINED                     | transferred, minimizing the overhead of the migration.             |

**Separation of Compilation and Linking of Programs**&#x20;

Up until OpenCL 1.1, compilation and linking of programs could only be done together using clBuildProgram. Starting with OpenCL 1.2, this process can be done separately. In addition, the following can now be performed.&#x20;

 Embedded Header: Allows header sources to come from program objects instead of just head files, instead of having to include the search path of the header in the build option. \


 Libraries: The linker allows for linking of compiled objects and libraries into a program executable or library. \


The following function is used for compiling a program.&#x20;

> cl\_int clCompileProgram(cl\_program program,&#x20;
>
> cl\_uint num\_devices,&#x20;
>
> const char \*options,&#x20;
>
> cl\_uint num\_input\_headers,&#x20;
>
> const cl\_program \*input\_headers,&#x20;
>
> const char \*\*header\_include\_names,&#x20;
>
> void (CL\_CALLBACK \*pfn\_notify)(cl\_program program,&#x20;
>
> void \*user\_data),&#x20;
>
> void \*user\_data)&#x20;

device\_list is the list of devices for which to perform the compilation. This value can be set to NULL to compile the program for all devices associated with program.&#x20;

input\_headers is a list of program embedded headers created with clCreateProgramWithSource. header\_include\_names should be set such that each string element corresponds to the name of the header files.&#x20;

An example usage is as follows. For instance, if the source-file of the kernel is as follows.

> \#include \<header1.h>&#x20;
>
> \#include \<dir/header2.h>&#x20;
>
> \_\_kernel void test\_kernel (int n, int m)&#x20;
>
> {&#x20;
>
> ...&#x20;
>
> }&#x20;

The program objects for the 2 include-files are created as follows.

> cl\_program header1\_pg = clCreateProgramWithSource(context, 1, \&header1\_src, NULL, \&err);&#x20;
>
> cl\_program header2\_pg = clCreateProgramWithSource(context, 1, \&header2\_src, NULL, \&err);&#x20;

If no callback is set (pfn\_notify is set to NULL), clCompileProgram will be a blocking call, and will not return until the compiling is finished.&#x20;

In order to link the compiled program objects to create a binary, the following function is used.&#x20;

> cl\_program clLinkProgram(cl\_context context,&#x20;
>
> cl\_uint num\_devices,&#x20;
>
> const cl\_device\_id \*device\_list,&#x20;
>
> const char \*options,&#x20;
>
> cl\_uint num\_input\_programs,&#x20;
>
> const cl\_program \*input\_programs,&#x20;
>
> void (CL\_CALLBACK \*pfn\_notify) (cl\_program program,&#x20;
>
> Void \*user\_data),&#x20;
>
> void \*user\_data,&#x20;
>
> cl\_int \*errcode\_ret)&#x20;

Similarly to clCompileProgram, device\_list can be set to NULL, which will perform linking towards all devices associated with the context. If no callback is set (pfn\_notify is set to NULL), clLinkProgram will be a blocking call, returning after linking is performed.&#x20;

For compile options and build options, refer to the function reference in Chapter 8.&#x20;

**clGetProgramInfo**&#x20;

This function is used to obtain information from a program object.&#x20;

cl\_int clGetProgramInfo(cl\_program program,&#x20;

cl\_program\_info param\_name,&#x20;

size\_t param\_value\_size,&#x20;

void \*param\_value,&#x20;

size\_t \*param\_value\_size\_ret)&#x20;

In OpenCL 1.2, the following can be passed in additionally as the parameter name for the 2nd argument.

| cl\_program\_info\_param\_name  | Return Type  | Description                                                         |
| ------------------------------- | ------------ | ------------------------------------------------------------------- |
| CL\_PROGRAM\_NUM\_KERNELS       | size\_t      | Returns the number of kernels contained within the program object.  |
| CL\_PROGRAM\_KERNEL\_NAMES      | char\[]      | Returns the names of kernels contained within the program object.   |

**clGetProgramBuildInfo**&#x20;

This function can be used to obtain build information from a program object.&#x20;

> cl\_int clGetProgramBuildInfo(cl\_program program,
>
> cl\_device\_id device,&#x20;
>
> cl\_program\_build\_info param\_name,&#x20;
>
> size\_t param\_value\_size,&#x20;
>
> void \*param\_value,&#x20;
>
> size\_t \*param\_value\_size\_ret)&#x20;

In OpenCL 1.2, the following can be passed in additionally as the parameter name for the 3rd argument.

| cl\_program\_build\_info   | Return Type                | Description                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CL\_PROGRAM\_BINARY\_TYPE  | cl\_program\_binary\_type  | <p>Returns one of the following. </p><p>CL_PROGRAM_BINARY_TYPE_NONE: No binary exist that is associated with the device. </p><p>CL_PROGRAM_BINARY_TYPE_COMPILED_OBJECT: The object is a compiled binary. </p><p>CL_PROGRAM_BINARY_TYPE_LIBRARY: The object is a library </p><p>CL_PROGRAM_BINARY_TYPE_EXECUTABLE: The object is executable </p> |

**clGetKernelArgInfo**&#x20;

This function can be used to obtain kernel argument information.&#x20;

> cl\_int clGetKernelArgInfo(cl\_kernel kernel,&#x20;
>
> cl\_uint arg\_index,&#x20;
>
> cl\_kernel\_arg\_info param\_name,&#x20;
>
> size\_t param\_value\_size,&#x20;
>
> void \*param\_value,&#x20;
>
> size\_t \*param\_value\_size\_ret)&#x20;

arg\_index specifies the argument for which to retrieve information. This index corresponds to the arg\_index specified in clSetKernelArg. The information that can be obtained is the following.

| param\_name                          | Return Type                          | Description                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CL\_KERNEL\_ARG\_ADDRESS\_QUALIFIER  | cl\_kernel\_arg\_address\_qualifier  | <p>Returns the address qualifier. The following values can be returned: </p><p>CL_KERNEL_ARG_ADDRESS_GLOBAL </p><p>CL_KERNEL_ARG_ADDRESS_LOCAL </p><p>CL_KERNEL_ARG_ADDRESS_CONSTANT </p><p>CL_KERNEL_ARG_ADDRESS_PRIVATE </p><p>The default address qualifier is CL_KERNEL_ARG_ADDRESS_PRIVATE unless explicitly changed </p>       |
| CL\_KERNEL\_ARG\_ACCESS\_QUALIFIER   | cl\_kernel\_arg\_access\_qualifier   | <p>Returns the access qualifier. The following values can be returned. </p><p>CL_KERNEL_ARG_ACCESS_READ_ONLY </p><p>CL_KERNEL_ARG_ACCESS_WRITE_ONLY </p><p>CL_KERNEL_ARG_ACCESS_READ_WRITE </p><p>CL_KERNEL_ARG_ACCESS_NONE </p><p>If the specified argument is not an image buffer, CL_KERNEL_ARG_ACCESS_NONE will be returned </p> |
| CL\_KERNEL\_ARG\_TYPE\_NAME          | char\[]                              | Returns the data type of the argument                                                                                                                                                                                                                                                                                                |
| CL\_KERNEL\_ARG\_TYPE\_QUALIFIER     | cl\_kernel\_arg\_type\_qualifier     | <p>Returns the type qualifier of the argument. The returned type will be a combination of the following. </p><p>CL_KERNEL_ARG_TYPE_CONST </p><p>CL_KERNEL_ARG_TYPE_RESTRICT </p><p>CL_KERNEL_ARG_TYPE_VOLATILE </p><p>If no type qualifier is present, CL_KERNEL_ARG_TYPE_NONE will be returned </p>                                 |
| CL\_KERNEL\_ARG\_NAME                | char\[]                              | Returns the name of the argument                                                                                                                                                                                                                                                                                                     |

The only way CL\_KERNEL\_ARG\_TYPE\_VOLATILE can be returned is when the type qualifier volatile is specified in the argument, and the argument is a pointer. For example, if the kernel argument is int volatile \*x, CL\_KERNEL\_ARG\_TYPE\_VOLATILE will be returned, but if the argument is int \* volatile x, CL\_KERNEL\_ARG\_TYPE\_NONE is returned.&#x20;

**Controlling Events**&#x20;

Up until OpenCL 1.1, barrier synchronization of commands and execution order control using events were performed using clEnqueueMarker, clEnqueueBarrier, and clEnqueueWaitForEvents. In OpenCL 1.2, these APIs are deprecated, being replaced with clEnqueueMarkerWithWaitList and clEnqueueBarrierWithWaitList.&#x20;

The marker command can be used to wait for a set of events in the command queue to complete.&#x20;

> cl\_int clEnqueueMarkerWithWaitList(&#x20;
>
> cl\_command\_queue command\_queue,&#x20;
>
> cl\_uint num\_events\_in\_wait\_list,&#x20;
>
> const cl\_event \*event\_wait\_list,&#x20;
>
> cl\_event \*event)&#x20;

This command returns an event, whose status can be used to wait until the set of events are complete. event\_wait\_list can be set to NULL, in which case the event marker will wait until all previously enqueued commands in the command queue have finished its execution.&#x20;

To enqueue a barrier command to a command queue, the following API is used.&#x20;

> cl\_int clEnqueueBarrierWithWaitList(&#x20;
>
> cl\_command\_queue command\_queue,&#x20;
>
> cl\_uint num\_events\_in\_wait\_list,&#x20;
>
> const cl\_event \*event\_wait\_list,&#x20;
>
> cl\_event \*event)&#x20;

The difference between this and clEnqueueMarkerWithWaitLIist is that this function blocks until the events of interest have all finished. event\_wait\_list can similarly be set to NULL, in which case the function blocks until all previously enqueued commands in the command queue have finished its execution.&#x20;

### _Changes in OpenCL C_&#x20;

**New image data types**&#x20;

Up until OpenCL 1.1, the available built-in data types for images were image2d\_t for 2D image object, and image3d\_t for 3D image object. OpenCL 1.2 introduced the following new image data types.&#x20;

 image1d\_t: 1D image data&#x20;

 image1d\_buffer\_t: image data created from buffer object&#x20;

 image1d\_array: array of 1D image data&#x20;

 image2d\_array\_t: array of 2D image data&#x20;



image1d\_buffer\_t will be discussed here, as the other 3 data types are self-explanatory. This is an image object whose 1D data is contained in a separate OpenCL buffer object. The association is made during clCreateImage, when cl\_image\_desc is passed in as a parameter, with the buffer parameter set to that of the OpenCL buffer object. The memory access qualifiers are inherited from buffer and thus ignored when specified in cl\_mem\_flags, with the exception of CL\_MEM\_READ\_WRITE, CL\_MEM\_READ\_ONLY, and CL\_MEM\_WRITE\_ONLY, which are inherited only when none of the 3 flags are set.&#x20;

The image data types are used only as a parameter to kernel functions, since it is a pointer to the object, and not a pointer to the actual data. To access the data itself requires the use of built-in functions. Similarly to the previous sections, the addition of image data types required changes to be made to OpenCL runtime functions (mainly clCreateImage) and built-in functions (read\_image{f|i|ui}, write\_image{f|i|ui}, get\_image\_width, get\_image\_height, get\_image\_channel\_data\_type).&#x20;

**New built-in functions**&#x20;

The following new built-in functions were introduced in OpenCL 1.2.&#x20;

 gentype popcount(gentype x)&#x20;



Returns the number of non-zero bits in x. The gentype here corresponds to char, char{2|3|4|8|16}, uchar, uchar{2,3,4,8,16}, short, short{2,3,4,8,16}, ushort, ushort{2|3|4|8|16}, int, int{2|3|4|8|16}, int, int{2|3|4|8|16}, uint, uint{2|3|4|8|16}, long, long|2|3|4|8|16}, ulong, ulong{2|3|4|8|16}.&#x20;

 int printf(constant char \*restrict format, ...)&#x20;

 Performs the same operation as the printf in C (C99), with the following differences.&#x20;

 The length modifier **l** is not supported for format placeholders **c** and **s**&#x20;

 Length modifier ll, j, z, t, L are reserved, but not supported&#x20;

 Conversion specifier **n** is reserved, but not supported&#x20;

 Vector specifier **vn** is supported for the printing of vector types&#x20;

 A float argument is converted to double for conversion specifiers **f**, **F**, **e**, **E**, **g**, **G**, **a**, **A** only when the double data type is supported.&#x20;

 For the embedded profile, the length modifier **l** is supported only when 64-bit integers are supported&#x20;

 Returns 0 is success, and -1 when error occurs during a call to printf&#x20;

 The conversion specifier **s** can be used only for arguments that are literal strings&#x20;

**Changes in Extensions**&#x20;

The double data type that was an extensions in OpenCL 1.1 have become a core feature in OpenCL 1.2. This has required changes to many OpenCL runtime functions and built-in functions, mainly for arguments and return values.&#x20;

**Storage class specifiers**&#x20;

The typedef, extern, and static storage-class specifiers are supported from OpenCL 1.2. The auto and register remains unsupported.&#x20;

The extern storage-class specifier can be used only for functions and global variables declared in program scope, or variables declared inside a function. The function can be either kernel or non-kernel functions. The static storage-class specifier can be used only for non-kernel functions and global variables declared in program scope.&#x20;

**MACROS**&#x20;

The \_\_OPENCL\_C\_VERSION\_\_ was added, which corresponds to the OpenCL C version specified in clBuildProgram and clCompileProgram, with -cl-std. If no OpenCL C version is specified using -cl-std, the OpenCL C version supported by the compiler for the device will be used.&#x20;

### _Deprecated functions_&#x20;

In addition to what has already been discussed in the previous sections, the following functions have become deprecated.&#x20;

 clUnloadCompiler, clGetExtensionFunctionAddress&#x20;

 clCreateFromGLTexture2D, clCreateFromGLTexture3D&#x20;

 CL\_DEVICE\_MIN\_DATA\_TYPE\_ALIGN\_SIZE enum to be passed into clGetDeviceInfo&#x20;

**Sample Program using the new features**&#x20;

The previous sections discussed the changes made to the OpenCL specification from 1.0 to 1.2. A sample program will be written in this section, which utilizes the new features of OpenCL. Note, however, that as of this writing, no environment exists which fully passes the OpenCL 1.2 conformance test16. AMD Accelerated Parallel Processing (APP) SDK, however has a preview-supported version of OpenCL 1.2, which implements most of the new features. This implementation was used to test the sample programs from this section. The tested environment is as follows.&#x20;

| Environment  | Version                                  |
| ------------ | ---------------------------------------- |
| CPU          | Phenom II X6 T1100 3.3 GHz               |
| GPU          | Radeon 6970                              |
| OS           | Windows 7 64bit                          |
| Driver       | Version 8.95                             |
| CL Runtime   | OpenCL 1.1 AMD-APP.internal.opt (891)17  |
| CAL          | Version 1.4.169                          |

### _Using sub-devices_&#x20;

In this example, the new sub-device feature will be used, which will device a CPU device into 2 sub-devices, and execute the same kernel in both devices, changing the argument passed in. Since each device maintains an independent command queue, the 2 tasks can be performed in parallel.&#x20;

**List 7.1: Sample program using sub-devices**&#x20;

> \#include \<cassert>&#x20;
>
> \#include \<cstring>&#x20;
>
> \#include \<iostream>&#x20;
>
> \#include \<CL/cl.h>&#x20;
>
> \#define USING\_SUB\_DEVICE&#x20;
>
> int main(int argc, char \*argv\[])&#x20;
>
> {&#x20;
>
> cl\_int ret;&#x20;
>
> /\* get platform ID \*/&#x20;
>
> cl\_uint num\_platform;&#x20;
>
> cl\_platform\_id platform\_id;&#x20;
>
> ret = clGetPlatformIDs(1, \&platform\_id, \&num\_platform);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> \#if defined USING\_SUB\_DEVICE&#x20;
>
> /\* get device IDs \*/&#x20;
>
> cl\_uint num\_device;&#x20;
>
> cl\_device\_id device\_id;&#x20;
>
> ret = clGetDeviceIDs(platform\_id, CL\_DEVICE\_TYPE\_CPU, 1, \&device\_id, \&num\_device);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* get number of compute unit \*/&#x20;
>
> cl\_uint num\_cu;&#x20;
>
> ret = clGetDeviceInfo(device\_id, CL\_DEVICE\_MAX\_COMPUTE\_UNITS, sizeof(cl\_uint), \&num\_cu, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* partition devices \*/&#x20;
>
> cl\_device\_id device\_ids\[2];ret = clCreateSubDevices(device\_id, props, 2, device\_ids, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> \#else&#x20;
>
> /\* get device IDs \*/&#x20;
>
> cl\_uint num\_device;&#x20;
>
> cl\_device\_id device\_ids\[2];&#x20;
>
> ret = clGetDeviceIDs(platform\_id, CL\_DEVICE\_TYPE\_ALL, 2, device\_ids, \&num\_device);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> \#endif&#x20;
>
> /\* create context and command queue \*/&#x20;
>
> cl\_context context;&#x20;
>
> cl\_command\_queue command\_queues\[2];&#x20;
>
> context = clCreateContext(NULL, 2, device\_ids, NULL, NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> for (unsigned int i=0; i<2; ++i)&#x20;
>
> {&#x20;
>
> command\_queues\[i] = clCreateCommandQueue(context, device\_ids\[i], 0, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> }&#x20;
>
> /\* build kernel \*/&#x20;
>
> const char \*source =&#x20;
>
> "#pragma OPENCL EXTENSION cl\_amd\_printf : enable¥n"&#x20;
>
> "\_\_kernel¥n"&#x20;
>
> "void my\_kernel(int i)¥n"&#x20;
>
> "{¥n"&#x20;
>
> "printf(¥"I am device %d.¥¥n¥", i);¥n"&#x20;
>
> "}¥n";&#x20;
>
> size\_t source\_len = strlen(source);&#x20;
>
> cl\_program program = clCreateProgramWithSource(context, 1, \&source, \&source\_len, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> ret = clBuildProgram(program, 2, device\_ids, NULL, NULL, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> cl\_kernel kernel = clCreateKernel(program, "my\_kernel", \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* execute \*/&#x20;
>
> for (unsigned int i=0; i<2; ++i)&#x20;
>
> {&#x20;
>
> clSetKernelArg(kernel, 0, sizeof(cl\_int), \&i);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> clEnqueueTask(command\_queues\[i], kernel, 0, NULL, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> }&#x20;
>
> for (unsigned int i=0; i<2; ++i)&#x20;
>
> {&#x20;
>
> clFinish(command\_queues\[i]);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> }&#x20;
>
> /\* finalizing \*/&#x20;
>
> clReleaseKernel(kernel);&#x20;
>
> for (unsigned int i=0; i<2; ++i)&#x20;
>
> {&#x20;
>
> clReleaseCommandQueue(command\_queues\[i]);&#x20;
>
> }&#x20;
>
> clReleaseContext(context);&#x20;
>
> return 0;&#x20;
>
> }&#x20;

We will now walk you through the important lines in the program. CL\_DEVICE\_TYPE\_CPU is specified in clGetDeviceIDs to obtain a list of CPUs that can be used as a device.

> cl\_uint num\_device;&#x20;
>
> cl\_device\_id device\_id;&#x20;
>
> ret = clGetDeviceIDs(platform\_id, CL\_DEVICE\_TYPE\_CPU, 1, \&device\_id, \&num\_device);&#x20;

Next, we look at the number of compute units on the device.

> cl\_uint num\_cu;&#x20;
>
> ret = clGetDeviceInfo(device\_id, CL\_DEVICE\_MAX\_COMPUTE\_UNITS, sizeof(cl\_uint), \&num\_cu, NULL);&#x20;

The value obtained will be used as a basis to partition the CPU device into sub-devices. We will create the sub-devices so that the sub-devices will use the same number of compute units. This is done by specifying CL\_DEVICE\_PARTITION\_EQUALLY.

> cl\_device\_id device\_ids\[2];&#x20;
>
> const cl\_device\_partition\_property props\[] = {CL\_DEVICE\_PARTITION\_EQUALLY, num\_cu/2, 0};&#x20;
>
> ret = clCreateSubDevices(device\_id, props, 2, device\_ids, NULL);&#x20;

The rest of the code in the program is written in the same manner as that for programming multiple devices. A context is created, from which a command queue is created for each sub-device, and then each command queue is executed.&#x20;

Execution of the sample program should result in the following.&#x20;

> $ ./subdevice&#x20;
>
> I am device 0.&#x20;
>
> I am device 1.&#x20;

### _Sample Program using Image Objects_&#x20;

In this section, the image objects will be created using clCreateImage, which is the new API introduced in OpenCL 1.2 for creating image objects. The image object will then be filled using clEnqueueFillImage.&#x20;

**List 7.2 Sample Program using Image Objects**&#x20;

> \#include \<cassert>&#x20;
>
> \#include \<cstring>&#x20;
>
> \#include \<iomanip>&#x20;
>
> \#include \<iostream>&#x20;
>
> \#include \<vector>&#x20;
>
> \#include \<malloc.h>&#x20;
>
> \#include \<CL/cl.h>&#x20;
>
> \#ifdef \_MSC\_VER&#x20;
>
> \#define ALIGNED\_MALLOC(size, alignment) \_aligned\_malloc(size, alignment)&#x20;
>
> \#define ALIGNED\_FREE(ptr) \_aligned\_free(ptr)&#x20;
>
> \#elif \_\_GNUC\_\_&#x20;
>
> \#define ALIGNED\_MALLOC(size, alignment) memalign(alignment, size)&#x20;
>
> \#define ALIGNED\_FREE(ptr) free(ptr)&#x20;
>
> \#else&#x20;
>
> \#error "unsupported compiler"&#x20;
>
> \#endif&#x20;
>
> \#define IMAGE\_W (8)&#x20;
>
> \#define IMAGE\_H (8)&#x20;
>
> int main(int argc, char \*argv\[])&#x20;
>
> {&#x20;
>
> cl\_int ret;&#x20;
>
> /\* get platform ID \*/&#x20;
>
> cl\_platform\_id platform\_id;&#x20;
>
> ret = clGetPlatformIDs(1, \&platform\_id, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* get device IDs \*/&#x20;
>
> cl\_device\_id device\_id;&#x20;
>
> ret = clGetDeviceIDs(platform\_id, CL\_DEVICE\_TYPE\_ALL, 1, \&device\_id, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* create context \*/&#x20;
>
> cl\_context context = clCreateContext(NULL, 1, \&device\_id, NULL, NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* create command queue \*/&#x20;
>
> cl\_command\_queue command\_queue = clCreateCommandQueue(context, device\_id, 0, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* create image object \*/&#x20;
>
> cl\_image\_format format;&#x20;
>
> format.image\_channel\_order = CL\_R;&#x20;
>
> format.image\_channel\_data\_type = CL\_UNSIGNED\_INT8;&#x20;
>
> cl\_image\_desc desc;&#x20;
>
> memset(\&desc, 0, sizeof(desc));&#x20;
>
> desc.image\_type = CL\_MEM\_OBJECT\_IMAGE2D;&#x20;
>
> desc.image\_width = IMAGE\_W;&#x20;
>
> desc.image\_height = IMAGE\_H;&#x20;
>
> cl\_mem image = clCreateImage(context, 0, \&format, \&desc, NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* filling background image \*/&#x20;
>
> {&#x20;
>
> const size\_t origin\[] = {0, 0, 0};&#x20;
>
> const size\_t region\[] = {IMAGE\_W, IMAGE\_H, 1};&#x20;
>
> cl\_uchar4 fill\_color;&#x20;
>
> fill\_color.s\[0] = 0;&#x20;
>
> fill\_color.s\[1] = 0;&#x20;
>
> fill\_color.s\[2] = 0;&#x20;
>
> fill\_color.s\[3] = 0;&#x20;
>
> ret = clEnqueueFillImage(command\_queue, image, \&fill\_color, origin, region, 0, NULL, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> }&#x20;
>
> /\* filling front image \*/&#x20;
>
> {&#x20;
>
> const size\_t origin\[] = {(IMAGE\_W\*1)/4, (IMAGE\_H\*1)/4, 0};&#x20;
>
> const size\_t region\[] = {(IMAGE\_W\*2)/4, (IMAGE\_H\*2)/4, 1};&#x20;
>
> cl\_uchar4 fill\_color;&#x20;
>
> fill\_color.s\[0] = 255;&#x20;
>
> fill\_color.s\[1] = 0;&#x20;
>
> fill\_color.s\[2] = 0;&#x20;
>
> fill\_color.s\[3] = 0;&#x20;
>
> ret = clEnqueueFillImage(command\_queue, image, \&fill\_color, origin, region, 0, NULL, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> }&#x20;
>
> /\* reading image \*/&#x20;
>
> cl\_uchar \*data = NULL;&#x20;
>
> {&#x20;
>
> size\_t num\_channels = 1;&#x20;
>
> data = static\_cast\<cl\_uchar\*>(ALIGNED\_MALLOC(IMAGE\_W\*IMAGE\_H\*sizeof(cl\_uchar), num\_channels\*sizeof(cl\_uchar)));&#x20;
>
> assert(NULL != data);&#x20;
>
> std::fill(\&data\[0], \&data\[IMAGE\_W\*IMAGE\_H], 128);&#x20;
>
> const size\_t origin\[] = {0, 0, 0};&#x20;
>
> const size\_t region\[] = {IMAGE\_W, IMAGE\_H, 1};&#x20;
>
> ret = clEnqueueReadImage(command\_queue, image, CL\_TRUE, origin, region, IMAGE\_W\*sizeof(cl\_uchar), 0, data, 0, NULL, NULL);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> }&#x20;
>
> /\* print image \*/&#x20;
>
> for (unsigned int h=0; h\<IMAGE\_H; ++h)&#x20;
>
> {&#x20;
>
> for (unsigned int w=0; w\<IMAGE\_W; ++w)&#x20;
>
> {&#x20;
>
> std::cout << std::setw(5) << std::right << static\_cast\<int>(data\[h\*IMAGE\_W+w]);&#x20;
>
> }&#x20;
>
> std::cout << std::endl;&#x20;
>
> }&#x20;
>
> /\* finalizing \*/&#x20;
>
> ALIGNED\_FREE(data);&#x20;
>
> clReleaseMemObject(image);&#x20;
>
> clReleaseCommandQueue(command\_queue);&#x20;
>
> clReleaseContext(context);&#x20;
>
> return 0;&#x20;
>
> }&#x20;

The structure of the program is as follows.&#x20;

**1. Create an image object with clCreateImage**&#x20;

**2. Fill the entire image with zeros using clEnqueueFillImage**&#x20;

**3. Fill over the center of the image with a different color**&#x20;

**4. Transfer the image to the host memory, and output the value of each pixels**&#x20;

In clCreateImage, the image parameters are grouped into the struct cl\_image\_format and cl\_image\_desc. The code is shown below.&#x20;

> cl\_image\_format format;&#x20;
>
> format.image\_channel\_order = CL\_R;&#x20;
>
> format.image\_channel\_data\_type = CL\_UNSIGNED\_INT8;&#x20;
>
> cl\_image\_desc desc;&#x20;
>
> memset(\&desc, 0, sizeof(desc));&#x20;
>
> desc.image\_type = CL\_MEM\_OBJECT\_IMAGE2D;&#x20;
>
> desc.image\_width = IMAGE\_W;&#x20;
>
> desc.image\_height = IMAGE\_H;&#x20;
>
> cl\_mem image = clCreateImage(context, 0, \&format, \&desc, NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;

cl\_image\_format specifies the pixel format, and cl\_image\_desc describes the format of the image.&#x20;

In this program, the cl\_image\_format is set such that each pixel has 1-channel, with each element being an 8-bit unsigned integer. cl\_image\_desc is set such that the image is a 2D image, with dimensions IMAGE\_W x IMAGE\_H. If the device does not support the image format, clCreateImage will return with CL\_IMAGE\_FORMAT\_NOT\_SUPPORTED.&#x20;

Once the image object is created, the entire region is filled with zeros.&#x20;

> const size\_t origin\[] = {0, 0, 0};&#x20;
>
> const size\_t region\[] = {IMAGE\_W, IMAGE\_H, 1};&#x20;
>
> cl\_uchar4 fill\_color;&#x20;
>
> fill\_color.s\[0] = 0;&#x20;
>
> fill\_color.s\[1] = 0;&#x20;
>
> fill\_color.s\[2] = 0;&#x20;
>
> fill\_color.s\[3] = 0;&#x20;
>
> ret = clEnqueueFillImage(command\_queue, image, \&fill\_color, origin, region, 0, NULL, NULL);&#x20;

The color to fill with is specified by fill\_color. Note that this color must const of 4 elements regardless of how many channels the image will have. The buffer will be filled only with fill\_color.s\[0], since CL\_R was specified in cl\_image\_format. origin and region sets the range of pixels to fill, which in this case is the entire image. origin is a 3-element vector, which contains the {x,y,z} coordinate of the image, and region is a 3-element vector, with each element specifying the number of pixels to fill in each direction.&#x20;

In the next clEnqueueFillImage, the fill range as well as the color has been changed.&#x20;

> const size\_t origin\[] = {(IMAGE\_W\*1)/4, (IMAGE\_H\*1)/4, 0};&#x20;
>
> const size\_t region\[] = {(IMAGE\_W\*2)/4, (IMAGE\_H\*2)/4, 1};&#x20;
>
> cl\_uchar4 fill\_color;&#x20;
>
> fill\_color.s\[0] = 255;&#x20;
>
> fill\_color.s\[1] = 0;&#x20;
>
> fill\_color.s\[2] = 0;&#x20;
>
> fill\_color.s\[3] = 0;&#x20;
>
> ret = clEnqueueFillImage(command\_queue, image, \&fill\_color, origin, region, 0, NULL, NULL);&#x20;

Since CL\_R will only look at the element in index 0, the value that concerns us is 255, which is the largest number that can be represented in 8 bits. Thus, the resulting image will be a white square in the middle, in front of a black background. Execution of this sample program should result in the following.

> $ ./image&#x20;
>
> 0 0 0 0 0 0 0 0&#x20;
>
> 0 0 0 0 0 0 0 0&#x20;
>
> 0 0 255 255 255 255 0 0&#x20;
>
> 0 0 255 255 255 255 0 0&#x20;
>
> 0 0 255 255 255 255 0 0&#x20;
>
> 0 0 255 255 255 255 0 0&#x20;
>
> 0 0 0 0 0 0 0 0&#x20;
>
> 0 0 0 0 0 0 0 0&#x20;

### _Sample Program using Migration_&#x20;

Up until OpenCL 1.1, there was no way to explicitly specify where the actual data in the memory object existed. In some implementations, there was a possibility that the memory allocation or memory transfer could take place only when the data was actually used. OpenCL 1.2 introduced a mechanism for explicitly specifying which memory is to be used.&#x20;

The following sample program uses clEnqueueMigrateMemObjects to explicitly specify the location  of the memory object.&#x20;

**List 7.3 Sample Program using Migration**&#x20;

> \#include \<cassert>&#x20;
>
> \#include \<iostream>&#x20;
>
> \#include \<CL/cl.h>&#x20;
>
> int main(int argc, char \*argv\[])&#x20;
>
> {&#x20;
>
> cl\_int ret;&#x20;
>
> /\* get platform ID \*/&#x20;
>
> cl\_uint num\_platform;&#x20;
>
> cl\_platform\_id platform\_id;&#x20;
>
> ret = clGetPlatformIDs(1, \&platform\_id, \&num\_platform);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* get device IDs \*/&#x20;
>
> cl\_uint num\_device;&#x20;
>
> cl\_device\_id device\_ids\[2];&#x20;
>
> ret = clGetDeviceIDs(platform\_id, CL\_DEVICE\_TYPE\_ALL, 2, device\_ids, \&num\_device);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> /\* create context and command queue \*/&#x20;
>
> cl\_context context;&#x20;
>
> cl\_command\_queue command\_queues\[2];&#x20;
>
> context = clCreateContext(NULL, 2, \&device\_ids\[0], NULL, NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> for (unsigned int i=0; i<2; ++i)&#x20;
>
> {&#x20;
>
> command\_queues\[i] = clCreateCommandQueue(context, device\_ids\[i], 0, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> }&#x20;
>
> cl\_mem mem1 = clCreateBuffer(context, CL\_MEM\_READ\_WRITE, 128\*sizeof(cl\_float4), NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> ret = clEnqueueMigrateMemObjects( command\_queues\[0], 1, \&mem1, CL\_MIGRATE\_MEM\_OBJECT\_CONTENT\_UNDEFINED, 0, 0, 0 );&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> cl\_mem mem2 = clCreateBuffer(context, CL\_MEM\_READ\_WRITE, 128\*sizeof(cl\_float4), NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> ret = clEnqueueMigrateMemObjects( command\_queues\[1], 1, \&mem2, CL\_MIGRATE\_MEM\_OBJECT\_CONTENT\_UNDEFINED, 0, 0, 0 );&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> clReleaseMemObject(mem1);&#x20;
>
> clReleaseMemObject(mem2);&#x20;
>
> for (unsigned int i=0; i<2; ++i)&#x20;
>
> {&#x20;
>
> clReleaseCommandQueue(command\_queues\[i]);&#x20;
>
> }&#x20;
>
> clReleaseContext(context);&#x20;
>
> return 0;&#x20;
>
> }&#x20;

This program first creates 2 command queues within 1 OpenCL context.

> cl\_uint num\_device;&#x20;
>
> cl\_device\_id device\_ids\[2];&#x20;
>
> ret = clGetDeviceIDs(platform\_id, CL\_DEVICE\_TYPE\_ALL, 2, device\_ids, \&num\_device);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> cl\_context context;&#x20;
>
> cl\_command\_queue command\_queues\[2];&#x20;
>
> context = clCreateContext(NULL, 2, \&device\_ids\[0], NULL, NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> for (unsigned int i=0; i<2; ++i)&#x20;
>
> {&#x20;
>
> command\_queues\[i] = clCreateCommandQueue(context, device\_ids\[i], 0, \&ret);&#x20;

A memory object is then created, associating it with a specific device.

> cl\_mem mem1 = clCreateBuffer(context, CL\_MEM\_READ\_WRITE, 128\*sizeof(cl\_float4), NULL, \&ret);&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;
>
> ret = clEnqueueMigrateMemObjects( command\_queues\[0], 1, \&mem1, CL\_MIGRATE\_MEM\_OBJECT\_CONTENT\_UNDEFINED, 0, 0, 0 );&#x20;
>
> assert(CL\_SUCCESS == ret);&#x20;

The CL\_MIGRATE\_MEM\_OBJECT\_CONTENT\_UNDEFINED specified as the 4th argument implies that no memory transfer of the data will take place during the call. Since no data is placed inside mem1 when clCreateBuffer was called, there would be no point in making sure that the new location of cl\_mem contains the same information as the original.&#x20;

Now the device associated with command\_queues\[0] should have allocated 128\*sizeof(cl\_float4) bytes for the memory object. Any access to the memory object after this, which includes specifying the memory object during kernel calls, clEnqueueReadBuffer and clEnqueueWriteBuffer, is guaranteed to not require overheads due to memory allocation.&#x20;
