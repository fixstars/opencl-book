# Changes made in update from 1.0 to 1.1

As of this writing (2012/1/17), the latest available OpenCL Specification is 1.2, revision 15. This chapter will walk through the changes made in the specification from 1.0 to 1.2.

This section will highlight the changes made between the 1.0 and 1.1 specifications. In particular, changes in the platform layer/runtime, OpenCL C, deprecated functions, as well as the extensions will be discussed.

### _Changes in the OpenCL Platform Layer and the Runtime_&#x20;

**clGetDeviceInfo()**&#x20;

This API is used to obtain information about the OpenCL device installed in the system.&#x20;

> Cl\_int clGetDeviceInfo(cl\_device\_id device, // device returned by clGetDeviceIDs&#x20;
>
> cl\_device\_info param\_name, // enum of the parameter to obtain&#x20;
>
> size\_t param\_value\_size, // size of buffer allocated for param\_value&#x20;
>
> void \*param\_value, // returned param value&#x20;
>
> size\_t \*param\_value\_size\_ret) // actual size of param\_value returned&#x20;

The OpenCL 1.1 specification allows the following additional parameters to be obtained.

| cl\_device\_info                                                                               | Return Type  | Description                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CL\_DEVICE\_NATIVE\_VECTOR\_WIDTH\_ {CHAR \| SHORT \| INT \| LONG \| FLOAT \| DOUBLE \| HALF}  | cl\_int      | Returns the native ISA vector width                                                                                                                                                         |
| CL\_DEVICE\_HOST\_UNIFIED\_MEMORY                                                              | bool         | Returns CL\_TRUE if the device and the host have a                                                                                                                                          |
|                                                                                                |              | unified memory subsystem, and CL\_FALSE otherwise.                                                                                                                                          |
| CL\_DEVICE\_OPENCL\_C\_VERSION                                                                 | char\[]      | Returns the highest OpenCL C version supported by the compiler for this device. Note that the device itself may support a higher version, which can be obtained using CL\_DEVICE\_VERSION.  |

The return types are changed for the following APIs.

| cl\_device\_info                  | Return Type  | Description                                                                                                                         |
| --------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| CL\_DEVICE\_MAX\_PARAMETER\_SIZE  | size\_t      | Max size in bytes of the arguments that can be passed to a kernel. The minimum value has increased from 256 to 1024 in OpenCL 1.1.  |
| CL\_DEVICE\_LOCAL\_MEM\_SIZE      | cl\_ulong    | Size of local memory area in bytes. The minimum value is 32 KB.                                                                     |

**clGetContextInfo()**&#x20;

This API is used to obtain information about an OpenCL context.&#x20;

> Cl\_int clGetContextInfo( cl\_context context, // Context object&#x20;
>
> Cl\_context\_info param\_name, //enum of the parameter to obtain&#x20;
>
> Size\_t param\_value\_size, // size of buffer allocated for param\_value&#x20;
>
> Void \*param\_value, // returned param value&#x20;
>
> Size\_t \*param\_value\_size\_ret) // actual size of param\_value returned

The OpenCL 1.1 specification allows the following additional parameters to be obtained.

| cl\_context\_info          | Return Type  | Description                                             |
| -------------------------- | ------------ | ------------------------------------------------------- |
| CL\_CONTEXT\_NUM\_DEVICES  | cl\_uint     | Returns the number of devices associated with context.  |

**Image format**&#x20;

When creating an image object using clCreateImage2D(), clCreateImage3D(), etc, a pointer to the struct cl\_image\_format is passed in, which specifies the properties of the image to be transferred to the object.&#x20;

> typedef struct \_cl\_image\_format {&#x20;
>
> cl\_channel\_order image\_channel\_order; // Order of channels&#x20;
>
> cl\_channel\_type image\_channel\_data\_type; // Channel component information&#x20;
>
> } cl\_image\_format;&#x20;

The OpenCL 1.1 specification allows the following additional parameters to be obtained.&#x20;

\* CL\_Rx&#x20;

\* CL\_RGx&#x20;

\* CL\_RGBx&#x20;

These channel layouts are the same as CL\_R, CL\_RG, CL\_RGB supported in OpenCL 1.0, except for the fact that the value of alpha is set to 0.0f at the edges. (See Figure 5.6, 5.9 from Chapter 5)&#x20;

**clCreateSubBuffer()**&#x20;

This function allows a buffer object to be created within an existing buffer object.&#x20;

> cl\_mem clCreateSubBuffer( cl\_mem buffer, // Buffer object&#x20;
>
> cl\_mem\_flags flags, // Memory flags&#x20;
>
> cl\_buffer\_create\_type buffer\_create\_type, // Buffer type&#x20;
>
> const void \*buffer\_create\_info, // Buffer info&#x20;
>
> cl\_int \*errcode\_ret) // Error code&#x20;

The only type that can be passed in as cl\_buffer\_create\_type is the following.

| cl\_buffer\_create\_type          | Description                                                          |
| --------------------------------- | -------------------------------------------------------------------- |
| CL\_BUFFER\_CREATE\_TYPE\_REGION  | Create a buffer object that represents a specific region in buffer.  |

The buffer region is specified in buffer\_create\_info, which is a struct as described below:

> typedef struct \_cl\_buffer\_region {&#x20;
>
> size\_t origin; // Offset into the buffer (in Bytes)&#x20;
>
> size\_t size; // Size of the buffer (in Bytes)&#x20;
>
> } cl\_buffer\_region;&#x20;

If the origin and size is set such that the SubBuffer object region reaches beyond the boundary of the original buffer, CL\_INVALID\_VALUE will be returned.&#x20;

A SubBuffer object is used to identify a region of the main Buffer, which simplifies the process when working only that region. Note, however, that the SubBuffer cannot be specified in the first parameter to this function, to create a sub-SubBuffer.&#x20;

**New ways to access Buffer objects**&#x20;

To access a rectangular region from a buffer objects, the following methods were added: clEnqueueReadBufferRect(), clEnqueueWriteBufferRect(), clEnqueueCopyBufferRect().&#x20;

**clSetMObjectDestructorCallback()**&#x20;

This function can be called to register a callback to be called when the destructor for the memory object is called.&#x20;

> cl\_int clSetMemObjectDestructorCallback(cl\_mem memobj, // Memory object&#x20;
>
> void (CL\_CALLBACK \*pfn\_notify) (cl\_mem memobj, void \*user\_data), // Callback&#x20;
>
> void \*user\_data) // Argument passed into to the callback&#x20;

This function registers a user callback function on a callback stack associated with the memory object.

Since it is a stack, the registered callback functions are called in the reverse order in which they were registered, before the object itself is deleted. _user\_data_ is passed in as an argument for when _pfn\_notify_ is called. This value can be set to NULL if no argument is required. The callback function may be called asynchronously by the OpenCL implementation. The application must make sure the callback function is thread-safe.&#x20;

**clBuildProgram()**&#x20;

The OpenCL C version can now be specified when building a program object.&#x20;

> \-cl-std=

The OpenCL C version can be set, for example, by passing in "-cl=CL1.1" in the build option. If this is not set, the kernel will be built with using the value of CL\_DEVICE\_OPENCL\_C\_VERSION. If the specified OpenCL C exceeds that of CL\_DEVICE\_OPENCL\_C\_VERSION, which is the latest version specified, the build will fail with the appropriate code.&#x20;

**clGetKernelWorkGroupInfo()**&#x20;

This function retrieves information about the kernel object that may be specific to a device.&#x20;

> cl\_int clGetKernelWorkGroupInfo(cl\_kernel kernel, // kernel object&#x20;
>
> cl\_device\_id device, // device&#x20;
>
> cl\_kernel\_work\_group\_info param\_name, // the parameter to obtain&#x20;
>
> size\_t param\_value\_size, // size of buffer allocated for param\_value&#x20;
>
> void \*param\_value, // returned param value&#x20;
>
> size\_t \*param\_value\_size\_ret) // actual size of param value returned&#x20;

The OpenCL 1.1 specification allows the following additional parameters to be obtained.

| cl\_kernel\_work\_group\_info                        | Return Type  | Description                                                    |
| ---------------------------------------------------- | ------------ | -------------------------------------------------------------- |
| CL\_KERNEL\_PREFERRED\_WORK\_GROUP\_ SIZE\_MULTIPLE  | size\_t      | Returns the preferred multiple of work-group size for launch.  |

Calling this function provides a performance hint for when determining the workgroup size to use.

> cl\_event clCreateUserEvent(cl\_context context, // associated context&#x20;
>
> cl\_int \*errcode\_ret) // Error code&#x20;

Once created, the status of the event object is set to CL\_SUBMITTED. This status can be changed by calling the following.

> cl\_int clSetUserEventStatus(cl\_event event, // event for which to set status&#x20;
>
> cl\_int execution\_status) // status to set to&#x20;

The values that can be set for _execution\_status_ is CL\_COMPLETE for successful operation, or a negative number representing an error. The function may only be called once to change the status of the event.&#x20;

The introduction of user event allows for a command to be executed on the device only after the user event has finished.&#x20;

| Column - More about Event Objects                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <p>User Event is a type of an Event Object, which holds one of the following states when placed in a command queue using an OpenCL runtime: </p><p>* CL_QUEUE: This indicates that the command has been enqueued in the command queue. This is the initial status for all events except user events. </p><p>* CL_SUBMITTED: This is the initial state for all user events. For all other events, this indicates that the command has been submitted by the host to the device. </p><p>* CL_RUNNING: The device is currently executing the command. </p><p>* CL_COMPLETE: The command has executed successfully. </p><p>* Error Code: The command has returned with an error. </p> |

**clSetEventCallback()**&#x20;

This function sets a callback to be called based on the event status.&#x20;

> cl\_int clSetEventCallback(cl\_event event, // associated event&#x20;
>
> cl\_int command\_exec\_callback\_type, // status for which the callback is registered&#x20;
>
> void (CL\_CALLBACK \*pfn\_event\_notify) (cl\_event event,&#x20;
>
> // event object that calls the callback&#x20;
>
> cl\_int event\_command\_exec\_status, //status of command for which this callback function is invoked&#x20;
>
> void \*user\_data), // user-supplied data&#x20;
>
> void \*user\_data) // user-supplied data&#x20;

The callback function (pfn\_event\_notify) is triggered when the associated event enters the status specified in the 2nd argument (command\_exec\_callback\_type).&#x20;

The only value that can be passed in the 2nd argument is CL\_COMPLETE. (OpenCL 1.2 allows CL\_SUBMITTED and CL\_RUNNING). The callback function may be called asynchronously by the OpenCL implementation. The application must make sure the callback function is thread-safe.&#x20;

**clEnqueueNDRangeKernel()**&#x20;

This function is used to execute a kernel on the device. In the OpenCL 1.0 specification, the only argument that can be set as the 4th parameter (global\_work\_offset) was NULL. In OpenCL 1.1, an offset value may be entered, which is used to compute the global ID of the work-item. When NULL is set, the offset is set to 0 for each dimension.&#x20;

**Thread-Safety**&#x20;

All function call is now thread-safe, with the exception of clSetKernelArg().&#x20;

### _Changes in OpenCL C_&#x20;

**3-element vectors**&#x20;

OpenCL C supports the following data types: char, uchar, short, ushort, int, uint, float, long, and ulong. Vector data type can be defined by concatenating a data type with an integer value representing the number of elements in the vector. For example, a vector data type consisting of 4 float values is defined as float4.&#x20;

OpenCL 1.0 supported 2, 4, 8, and 16 as the number of elements. OpenCL 1.1 now allows a vector with 3-elements to be created.&#x20;

**New built-in functions**&#x20;

The following built-in functions are now available:&#x20;

 size\_t get\_global\_offset(uint dimindx)&#x20;



Retrieves the offset value which is set as the 4th argument to clEnqueueNDRangeKernel(). dimindx is the dimension from which to retrieve the offset from.&#x20;

 gentype maxmag(gentype x, gentype y)&#x20;



Returns gentype with a higher magnitude. Returns x if |x| > |y|, y if |y| > |x|, otherwise fmax(x,y). The gentype that is referred to correspond to one of: float, float2, float3, float4, float8, and float16. In OpenCL 1.2, double, double2, double3, double4, double8, and double16 are supported.&#x20;

 getntype minmag(gentype x, gentype y)&#x20;



Returns gentype with a lower magnitude. Returns x if |x| C |y|, y if |y| < |x|, otherwise fmin(x,y). The gentype corresponds to one of: float, float2, float3, float4, float8, and float16. In OpenCL 1.2, double, double2, double3, double4, double8, and double16 are supported.&#x20;

 gentype clamp(gentype x, gentype minval, genotype maxval)&#x20;

 genotype clamp(gentype x, sgentype minval, sgentype maxval)&#x20;



Clamps the value of _x_ to minval and maxval. The gentype corresponds to one of: char, char|2|3|4|8|16|, uchar, uchar|2|3|4|8|16|, short, short|2|3|4|8|16|, ushort, ushort|2|3|4|8|16|, int, int|2|3|4|8|16|, uint, uint|2|3|4|8|16|, long, long|2|3|4|8|16|, ulong, ulong|2|3|4|8|16|. sgentype refers to the scalar version of gentype, which is one of: char, uchar, short, ushort, int, uint, long, ulong. The behavior is undefined if _minval_ > _maxval_.&#x20;

**Extension now a core feature**&#x20;

The following features that were available as extensions in OpenCL 1.0 are now supported as core features:&#x20;

 cl\_khr\_byte\_addressable\_store&#x20;

In OpenCL 1.0, writing to memory using data types with size less than 32-bits to access the address, which includes char, uchar, uchar2, short, ushort, and half, were offered as extensions. OpenCL 1.1 now supports these by default.&#x20;

 cl\_khr\_global\_int32\_base\_atomics&#x20;

 cl\_khr\_global\_int32\_extended\_atomics&#x20;

 cl\_khr\_local\_int32\_base\_atomics&#x20;

 cl\_khr\_local\_int32\_extended\_atomics&#x20;



In OpenCL 1.0, atomic operations of int, uint, and float data in \_\_global or \_\_local memory were offered as extensions. OpenCL 1.1 now supports these by default. Note, however, that the name of the function has been changed from atom\_xxx to atomic\_xxx.&#x20;

**MACROS**&#x20;

The following macros are defined, which can be used to switch kernel code depending on the OpenCL version.&#x20;

 CL\_VERSION\_1\_0: substitutes the integer 100 reflecting the OpenCL 1.0 version&#x20;

 CL\_VERSION\_1\_1: substitutes the integer 110 reflecting the OpenCL 1.1 version.&#x20;



In OpenCL 1.2 the following will be defined:&#x20;

 CL\_VERSION\_1\_2: substitutes the integer 120 reflecting the OpenCL 1.2 version.&#x20;



The above value can be compared with \_\_OPENCL\_VERSION\_\_ to switch between OpenCL versions.&#x20;

### _Deprecated Functions_&#x20;

The following features were deprecated in OpenCL 1.1:&#x20;

 clSetCommandQueueProperty()&#x20;

 \_\_ROUNDING\_MODE\_\_ macro&#x20;

 "-cl-strict-aliasing" as an option to clBuildProgram()&#x20;

**Changes in Extensions**&#x20;

The following extensions became available in OpenCL 1.1:&#x20;

 cl\_khr\_gl\_event&#x20;



While there are other extensions that allows memory objects to be shared between OpenGL and OpenCL, this extension allows creating OpenCL event objects linked to OpenGL fence sync objects, potentially improving efficiency of sharing images and buffers between the two APIs.&#x20;

 cl\_khr\_d3d10\_sharing \


This extension provides interoperability between OpenCL and Direct3D 10. This is designed to function analogously to the OpenGL interoperability, providing functions for sharing memory objects, as well as other utility functions.&#x20;

**Changes in OpenCL Embedded Profile**&#x20;

Support for 64bit integer is now an option.&#x20;
